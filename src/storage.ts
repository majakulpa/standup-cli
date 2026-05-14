import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface Entry {
  id: string;
  text: string;
  date: string;
  createdAt: string;
}

export interface Store {
  entries: Entry[];
}

const STORE_DIR = path.join(os.homedir(), ".standup-cli");
const STORE_FILE = path.join(STORE_DIR, "data.json");

function ensureStore(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const empty: Store = { entries: [] };
    fs.writeFileSync(STORE_FILE, JSON.stringify(empty, null, 2));
  }
}

export function readStore(): Store {
  ensureStore();
  const raw = fs.readFileSync(STORE_FILE, "utf-8");
  return JSON.parse(raw) as Store;
}

export function writeStore(store: Store): void {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}