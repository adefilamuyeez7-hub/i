import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUsers, saveUser, getUserById } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      if (req.query.id) {
        const user = await getUserById(req.query.id as string);
        return res.status(200).json(user || { error: "Not found" });
      }
      const users = await getUsers();
      return res.status(200).json(users);
    }

    if (req.method === "POST") {
      const user = await saveUser(req.body);
      return res.status(201).json(user);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
