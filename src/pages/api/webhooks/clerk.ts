import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

enum EventType {
  UserCreated = "user.created",
}

const dto = z.object({
  data: z.object({
    id: z.string(),
  }),
  object: z.string(),
  type: z.nativeEnum(EventType),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedBody = dto.safeParse(req.body);

  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ error: "Invalid body", details: parsedBody.error });
  }

  const { type, data } = parsedBody.data;

  if (type === EventType.UserCreated) {
    await db.insert(users).values({
      clerkId: data.id,
    });

    return res.status(200).json({ success: true });
  }
}
