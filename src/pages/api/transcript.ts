import { Formidable } from "formidable";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { remove } from "fs-extra";
import { type NextApiRequest, type NextApiResponse } from "next";
import { createInterface } from "readline";

type TranscriptData = {
  fileName: string;
  transcript: string;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const tmpFolderPath = "./tmp";

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

    const [, files] = await form.parse(req);

    if (!files.file)
      return res.status(400).json({ message: "No file uploaded" });

    if (!existsSync("./tmp")) {
      mkdirSync("./tmp");
    }

    const writeTxtStream = createWriteStream(
      `${tmpFolderPath}/transcript.txt`,
      {
        encoding: "utf8",
      },
    );

    for (const file of files.file) {
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // const response = await openai.audio.transcriptions.create({
      //   model: "whisper-1",
      //   file: createReadStream(file.filepath),
      //   temperature: 0,
      //   response_format: "text",
      // });

      writeTxtStream.write(
        JSON.stringify({
          fileName: file.originalFilename,
          transcript: "testing...",
        }) + "\n",
      );
    }

    writeTxtStream.on("finish", () => {
      const readTxtStream = createReadStream(
        `${tmpFolderPath}/transcript.txt`,
        {
          encoding: "utf8",
        },
      );
      const writeJsonStream = createWriteStream(
        `${tmpFolderPath}/transcript.json`,
        { encoding: "utf8", flags: "w" },
      );
      const readLineInterface = createInterface({
        input: readTxtStream,
      });
      const result: TranscriptData[] = [];

      readLineInterface.on("line", (line) => {
        console.log("reading line");

        const parsed = JSON.parse(line) as TranscriptData;

        result.push(parsed);
      });

      writeJsonStream.on("finish", () => {
        const readJsonStream = createReadStream(
          `${tmpFolderPath}/transcript.json`,
        );

        res.writeHead(200);
        readJsonStream.pipe(res);

        readJsonStream.on("close", () => {
          readTxtStream.destroy();
          writeJsonStream.destroy();
          readJsonStream.destroy();
          res.end();

          remove(tmpFolderPath)
            .then(() => {
              console.log("tmp folder removed");
            })
            .catch((err) => {
              console.error(err);
            });
        });
      });

      readLineInterface.on("close", () => {
        writeJsonStream.write(JSON.stringify(result), () => {
          writeJsonStream.end();
        });
      });
    });

    writeTxtStream.end();
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
