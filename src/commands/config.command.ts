import chalk from 'chalk';
import path from 'path';
import readPackage from 'read-pkg';
import * as yargs from 'yargs';
import { configureConnection, getConnectionOptions } from '../connection';
import { initCommand } from '../utils/command.util';
import { printError } from '../utils/log.util';

interface IArgs {
  connection?: string;
  datasource: string;
  root: string;
}

export class ConfigCommand implements yargs.CommandModule<{}, IArgs> {
  command = 'config'
  describe = 'Show the TypeORM config'

  builder(args: yargs.Argv) {
    return args
      .option('connection', {
        alias: 'c',
        describe: 'Name of the typeorm connection.',
        type: 'string',
      })
      .option('datasource', {
        alias: 'd',
        default: '',
        describe: 'Name of the typeorm datasource file (json or js).',
        type: 'string',
      })
      .option('root', {
        alias: 'r',
        default: process.cwd(),
        describe: 'Path to your typeorm datasource file',
        type: 'string',
      })
  }

  async handler(args: yargs.Arguments<IArgs>) {
    const log = await initCommand();

    try {
      configureConnection({
        root: args.root,
        configName: args.datasource,
        connection: args.connection,
      })
      const option = await getConnectionOptions()
      log(option)
    } catch (error) {
      printError('Could not find the orm config file', error)
      process.exit(1)
    }
    process.exit(0)
  }
}
