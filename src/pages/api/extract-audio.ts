import { Formidable } from "formidable";
import { createReadStream } from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";
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

    form.on("file", (name, file) => {
      const fileStream = createReadStream(file.filepath);

      const audioStream = extractAudioStream(fileStream);

      res.writeHead(200, {
        "Content-Type": "audio/mp3",
      });
      audioStream.pipe(res);
    });

    await form.parse(req);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
