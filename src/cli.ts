#!/usr/bin/env node

import 'reflect-metadata';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { seedCommand } from './commands/seed.command';
import { configCommand } from './commands/config.command';
import { createCommand } from './commands/create.command';

export function runCli(args: Array<string>): object {
  return yargs(args)
    .usage('Usage: $0 <command> [options]')
    .command(configCommand)
    .command(seedCommand)
    .command(createCommand)
    .recommendCommands()
    .demandCommand(1)
    .strictCommands()
    .help('h')
    .alias('h', 'help')
    .argv;
}

runCli(hideBin(process.argv));
