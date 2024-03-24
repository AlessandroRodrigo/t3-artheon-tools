import { type NextApiRequest, type NextApiResponse } from "next";
import ytdl from "ytdl-core";
import { z } from "zod";

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

    ytdl(parserResult.data.urls[0], {
      filter: "audioonly",
      quality: "lowestaudio",
    }).pipe(res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
