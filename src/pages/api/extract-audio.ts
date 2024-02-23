import { type NextApiRequest, type NextApiResponse } from "next";
import type formidable from "formidable";
import { Formidable } from "formidable";
import { PassThrough, Writable } from "stream";
import { createReadStream } from "fs";
import {
  batchExtractAudio,
  extractAudioStream,
} from "~/server/services/extract-audio";
import MultiStream from "multistream";

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
    console.log("here...");

    const form = new Formidable({
      multiples: false,
      allowEmptyFiles: false,
      keepExtensions: true,
      maxTotalFileSize: 10 * 1024 * 1024 * 1024,
      maxFileSize: 10 * 1024 * 1024 * 1024,
    });

    form.on("file", (name, file) => {
      const fileStream = createReadStream(file.filepath);

      const audioStream = extractAudioStream(fileStream);

      res.writeHead(200, {
        "Content-Type": "audio/mp3",
      });
      audioStream.pipe(res);
    });

    await form.parse(req);

    // form.parse(req, async (err, fields, files) => {
    //   if (err) {
    //     return res.status(500).json({ message: "Error parsing form" });
    //   }
    //   if (!files.file) {
    //     return res.status(400).json({ message: "No file found" });
    //   }
    //   res.writeHead(200, { "Content-Type": "audio/mp3" });
    //   const filesPath = files.file.map((file) => file.filepath);
    //   const readStreams = filesPath.map((filePath) =>
    //     createReadStream(filePath),
    //   );
    //   // void batchExtractAudio(readStreams);
    //   if (!readStreams[0]) {
    //     return res.status(400).json({ message: "No file found" });
    //   }
    //   const output = await batchExtractAudio(readStreams);
    //   if (!output) {
    //     return res.status(500).json({ message: "Error processing files" });
    //   }
    //   const multistream = new MultiStream(output);
    //   // console.log(multistream);
    //   multistream.pipe(
    //     new Writable({
    //       write: (chunk) => {
    //         console.log(chunk);
    //       },
    //     }),
    //   );
    // });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
