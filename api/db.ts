import { promises as fs } from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data", "users.json");

async function ensureDB() {
  const dir = path.dirname(DB_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
  }
}

export async function getUsers() {
  await ensureDB();
  const data = await fs.readFile(DB_FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveUser(user: any) {
  await ensureDB();
  const users = await getUsers();
  const index = users.findIndex((u: any) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2));
  return user;
}

export async function getUserById(id: string) {
  const users = await getUsers();
  return users.find((u: any) => u.id === id);
}

export async function deleteUser(id: string) {
  const users = await getUsers();
  const filtered = users.filter((u: any) => u.id !== id);
  await fs.writeFile(DB_FILE, JSON.stringify(filtered, null, 2));
  return { success: true };
}
