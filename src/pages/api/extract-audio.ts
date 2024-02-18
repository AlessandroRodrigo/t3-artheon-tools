import { type NextApiRequest, type NextApiResponse } from "next";
import multer from "multer";
import formidable, { Formidable } from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

// async function parseFormData(
//   req: NextApiRequest & { files?: unknown },
//   res: NextApiResponse,
// ) {
//   const storage = multer.memoryStorage();
//   const multerUpload = multer({ storage });
//   const multerFiles = multerUpload.any();
//   await new Promise((resolve, reject) => {
//     multerFiles(req as any, res as any, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
//   return {
//     fields: req.body,
//     files: req.files,
//   };
// }

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
