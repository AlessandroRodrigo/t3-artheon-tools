import { queue, retry, type RetryOptions } from "async";
import type formidable from "formidable";
import { Formidable } from "formidable";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type ChatCompletionCreateParams } from "openai/resources/index.mjs";
import { logger } from "~/server/lib/logger";
import { openai } from "~/server/lib/openai";
import { writeErrorLog } from "~/server/lib/write-error-log";

export const config = {
  api: {
    bodyParser: false,
  },
};

const responseFormatMap: Record<
  string,
  ChatCompletionCreateParams.ResponseFormat["type"]
> = {
  json_object: "json_object",
  text: "text",
};

const retryOptions: RetryOptions<Error> = {
  times: 3,
  interval: (retryCount: number) => 60000 * Math.pow(2, retryCount),
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const form = new Formidable({
      multiples: true,
      allowEmptyFiles: false,
      keepExtensions: true,
      maxTotalFileSize: 100 * 1024 * 1024 * 1024,
      maxFileSize: 10 * 1024 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);

    const prompt = fields.prompt?.[0];
    const responseFormat = fields.responseFormat?.[0];

    if (!responseFormat || !responseFormatMap[responseFormat]) {
      return res.status(400).json({
        message: "Invalid response format",
      });
    }

    if (!prompt) return res.status(400).json({ message: "No prompt provided" });

    if (!files.file)
      return res.status(400).json({ message: "No file uploaded" });

    if (!existsSync("./tmp")) {
      mkdirSync("./tmp");
    }

    const outputResult: Array<Record<string, string>> = [];

    const fileSectionQueue = queue(
      (value: Record<string, string>, callback) => {
        retry(
          retryOptions,
          (retryCallback) => {
            if (!value) {
              logger.error("No text provided");
              return;
            }

            openai.chat.completions
              .create({
                model: "gpt-3.5-turbo",
                temperature: 0.3,
                response_format: {
                  type: responseFormatMap[responseFormat] ?? "text",
                },
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant designed to process knowledge.",
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                  {
                    role: "user",
                    content: JSON.stringify(value),
                  },
                ],
              })
              .then((response) => {
                if (!response.choices[0]?.message?.content) {
                  logger.error("No response content");
                  retryCallback(new Error("No response content"));
                  return;
                }

                const responseContent = JSON.parse(
                  response.choices[0]?.message.content,
                ) as Record<string, string>;
                outputResult.push(responseContent);

                logger.info(`Successfully processed section`);
                retryCallback();
              })
              .catch((error) => {
                logger.info(`Error processing section`, JSON.stringify(error));
                writeErrorLog(String(error));
                return retryCallback(error as Error);
              });
          },
          callback,
        );
      },
      10,
    );

    fileSectionQueue.drain(() => {
      logger.info("All sections processed");
      logger.info("Sending response");
      res.status(200).json(outputResult);
      res.end();
    });

    const fileQueue = queue((file: formidable.File, callback) => {
      logger.info(
        `Processing file: ${file.originalFilename} with ${fileSectionQueue.length()} sections`,
      );
      try {
        const originalContent = readFileSync(file.filepath, {
          encoding: "utf8",
        });
        const parsedOriginalContent = JSON.parse(originalContent) as Array<
          Record<string, string>
        >;

        parsedOriginalContent.forEach((section) => {
          fileSectionQueue.push(section).catch((err) => {
            logger.error(err);
          });
        });

        callback();
      } catch (error) {
        writeErrorLog(String(error));
        callback(error as Error);
      }
    }, 2);

    files.file.forEach((file) => {
      fileQueue.push(file).catch((err) => {
        logger.error(err);
      });
    });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
