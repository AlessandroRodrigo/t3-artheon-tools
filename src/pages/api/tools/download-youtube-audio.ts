import AdmZip from "adm-zip";
import { queue } from "async";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFile,
} from "fs";
import { remove } from "fs-extra";
import { type NextApiRequest, type NextApiResponse } from "next";
import { escape } from "querystring";
import ytdl from "ytdl-core";
import { z } from "zod";
import { logger } from "~/server/lib/logger";

const RequestBodyParser = z.object({
  urls: z.string().url().array(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const parserResult = RequestBodyParser.safeParse(req.body);

    if (!parserResult.success) {
      return res
        .status(400)
        .json({ message: "Invalid Request Body", details: parserResult.error });
    }

    if (!parserResult.data.urls[0]) {
      return res.status(400).json({ message: "No URLs provided" });
    }

    if (!existsSync("./tmp")) {
      mkdirSync("./tmp");
    }

    const processQueue = queue((url: string, callback) => {
      ytdl
        .getInfo(url)
        .then((info) => {
          const writeStream = createWriteStream(
            `./tmp/${info.videoDetails.title}.mp3`,
          );

          const stream = ytdl(url, {
            filter: "audioonly",
            quality: "lowestaudio",
          });

          stream.on("end", () => {
            callback();
          });

          stream.pipe(writeStream);
        })
        .catch((error) => {
          logger.error(error);
          callback(error as Error);
        });
    }, 3);

    processQueue.error((error) => {
      console.error(error);
      res.end();
    });

    processQueue.drain(() => {
      const zip = new AdmZip();
      const files = readdirSync("./tmp");

      files.forEach((file) => {
        zip.addLocalFile(`./tmp/${file}`);
      });

      zip.writeZip("./tmp/result.zip");

      readFile("./tmp/result.zip", (error, data) => {
        if (error) {
          logger.error(error);
          res.end();
        }

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${escape("result.zip")}`,
        );
        res.send(data);
        res.end();

        remove("./tmp").catch((error) => {
          logger.error(error);
        });
      });
    });

    parserResult.data.urls.forEach((url) => {
      processQueue.push(url).catch((error) => {
        console.error(error);
      });
    });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
