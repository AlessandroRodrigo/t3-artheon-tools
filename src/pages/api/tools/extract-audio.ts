import AdmZip from "adm-zip";
import { queue } from "async";
import formidable, { Formidable } from "formidable";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { exists, mkdir, readFile, remove } from "fs-extra";
import { type NextApiRequest, type NextApiResponse } from "next";
import { logger } from "~/server/lib/logger";
import { extractAudioStream } from "~/server/services/extract-audio";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const form = new Formidable({
      multiples: false,
      allowEmptyFiles: false,
      keepExtensions: true,
      maxTotalFileSize: 10 * 1024 * 1024 * 1024,
      maxFileSize: 10 * 1024 * 1024 * 1024,
    });

    const [, files] = await form.parse(req);

    if (!existsSync("./tmp")) {
      logger.info("Creating tmp directory");
      await mkdir("./tmp");
    }

    const processQueue = queue((file: formidable.File, callback) => {
      try {
        const writeStream = createWriteStream("./tmp/" + file.originalFilename);

        const fileStream = createReadStream(file.filepath);

        const audioStream = extractAudioStream(fileStream);

        audioStream.on("error", (err) => {
          logger.error("Error extracting audio", err);
        });

        audioStream.on("end", () => {
          logger.info("Audio extraction complete");
        });

        writeStream.on("error", (err) => {
          logger.error(`Error writing audio file: ${err.message}`);
        });

        writeStream.on("finish", () => {
          logger.info("Audio write complete");
          callback();
        });

        audioStream.pipe(writeStream);
      } catch (e) {
        logger.error("Error extracting audio", e);
        callback(e as Error);
      }
    }, 1);

    processQueue.error((err, file) => {
      logger.error(`Error processing audio file: ${err.message}`);
      logger.error(`File: ${file.toString()}`);
    });

    processQueue.drain(() => {
      logger.info("All audio files processed");

      const zip = new AdmZip();

      zip.addLocalFolder("./tmp");

      zip.writeZip("./tmp.zip");

      readFile("./tmp.zip", (err, data) => {
        if (err) {
          logger.error("Error reading zip file", err);
          return res.status(500).json({ message: "Error reading zip file" });
        }

        res.writeHead(200, {
          "Content-Type": "application/zip",
        });

        res.end(data);

        remove("./tmp").catch((err: Error) => {
          logger.error(`Error removing tmp directory: ${err.message}`);
        });
        remove("./tmp.zip").catch((err: Error) => {
          logger.error(`Error removing tmp.zip file: ${err.message}`);
        });
      });
    });

    files.file?.forEach((file) => {
      processQueue.push(file, (err) => {
        if (err) {
          logger.error("Error processing audio", err);
        }
      });
    });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
