#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { addEntry, listEntries, showSummary, deleteEntry } from "./commands";

const program = new Command();

program
  .name("standup")
  .description(
    chalk.cyan("📋 standup-cli") + " — log your work, generate your standup"
  )
  .version("1.0.0");

program
  .command("add <text>")
  .description("Add a new entry for today")
  .action((text: string) => {
    addEntry(text);
  });

program
  .command("list")
  .description("List all entries for today (or a specific date)")
  .option("-d, --date <date>", "Date in YYYY-MM-DD format")
  .action((options: { date?: string }) => {
    listEntries(options.date);
  });

program
  .command("summary")
  .description("Print a standup summary for today (or a specific date)")
  .option("-d, --date <date>", "Date in YYYY-MM-DD format")
  .action((options: { date?: string }) => {
    showSummary(options.date);
  });

program
  .command("delete <id>")
  .description("Delete an entry by its ID prefix")
  .action((id: string) => {
    deleteEntry(id);
  });

program.parse(process.argv);