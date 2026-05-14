import chalk from "chalk";
import { readStore, writeStore, todayString, Entry } from "./storage";
import { randomUUID } from "crypto";

export function addEntry(text: string): void {
  const store = readStore();
  const entry: Entry = {
    id: randomUUID(),
    text: text.trim(),
    date: todayString(),
    createdAt: new Date().toISOString(),
  };
  store.entries.push(entry);
  writeStore(store);
  console.log(chalk.green("✔") + " Entry added: " + chalk.white(entry.text));
}

export function listEntries(dateStr?: string): void {
  const store = readStore();
  const target = dateStr ?? todayString();
  const entries = store.entries.filter((e) => e.date === target);
  if (entries.length === 0) {
    console.log(
      chalk.yellow(`No entries for ${target}.`) +
        " Use " +
        chalk.cyan('standup add "<text>"') +
        " to log something."
    );
    return;
  }
  console.log(chalk.bold(`\n📋 Entries for ${target}:\n`));
  entries.forEach((e, i) => {
    console.log(`  ${chalk.gray(String(i + 1) + ".")} ${e.text}`);
  });
  console.log();
}

export function showSummary(dateStr?: string): void {
  const store = readStore();
  const target = dateStr ?? todayString();
  const entries = store.entries.filter((e) => e.date === target);
  if (entries.length === 0) {
    console.log(chalk.yellow(`No entries for ${target} to summarise.`));
    return;
  }
  const dayLabel = target === todayString() ? "Today" : target;
  console.log(chalk.bold.cyan("\n🗒  Standup Summary\n"));
  console.log(
    chalk.bold(
      "What I did " + (dayLabel === "Today" ? "today" : `on ${dayLabel}`) + ":"
    )
  );
  entries.forEach((e) => {
    console.log(`  • ${e.text}`);
  });
  console.log();
}

export function deleteEntry(id: string): void {
  const store = readStore();
  const before = store.entries.length;
  store.entries = store.entries.filter((e) => !e.id.startsWith(id));
  if (store.entries.length === before) {
    console.log(chalk.red("No entry found with that ID."));
    return;
  }
  writeStore(store);
  console.log(chalk.green("✔") + " Entry deleted.");
}