import { type NextApiRequest, type NextApiResponse } from "next";
import type formidable from "formidable";
import { Formidable } from "formidable";

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
    const data = await new Promise<{
      err: unknown;
      fields: formidable.Fields<string>;
      files: formidable.Files<string>;
    }>((resolve, reject) => {
      const form = new Formidable();

      form.parse(req, (err: unknown, fields, files) => {
        if (err) reject({ err });
        resolve({ err, fields, files });
      });
    });
    console.log(data.files);

    return res.status(200).json({ message: "File received" });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
