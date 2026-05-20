import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Use temp directory for Vercel compatibility
const DB_DIR = process.env.VERCEL ? path.join("/tmp", "proof-pass-db") : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "users.json");

// In-memory fallback for Vercel
let inMemoryDb: any[] = [];

async function ensureDB() {
  try {
    const dir = DB_DIR;
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.warn("Failed to access filesystem, using in-memory storage", error);
  }
}

export async function getUsers() {
  try {
    await ensureDB();
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return inMemoryDb;
    }
  } catch (error) {
    console.error("Error reading users:", error);
    return inMemoryDb;
  }
}

export async function saveUser(user: any) {
  try {
    await ensureDB();
    const users = await getUsers();
    const index = users.findIndex((u: any) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
      console.warn("Failed to write to filesystem, using in-memory storage", error);
      inMemoryDb = users;
    }
    
    return user;
  } catch (error) {
    console.error("Error saving user:", error);
    inMemoryDb.push(user);
    return user;
  }
}

export async function getUserById(id: string) {
  try {
    const users = await getUsers();
    return users.find((u: any) => u.id === id);
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function deleteUser(id: string) {
  try {
    await ensureDB();
    const users = await getUsers();
    const filtered = users.filter((u: any) => u.id !== id);
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(filtered, null, 2));
    } catch (error) {
      console.warn("Failed to write to filesystem, using in-memory storage", error);
      inMemoryDb = filtered;
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false };
  }
}
