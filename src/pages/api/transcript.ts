import { Formidable } from "formidable";
import { createReadStream } from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { openai } from "~/server/lib/openai";
import { OpenAIStream } from "ai";

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
    });

    const [, files] = await form.parse(req);

    if (!files.file?.[0]) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: createReadStream(files.file[0].filepath),
      temperature: 0.2,
      response_format: "text",
    });

    res.status(200).json({ transcript: response });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
