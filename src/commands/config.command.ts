import readPackage from 'read-pkg';
import * as yargs from 'yargs'
import chalk from 'chalk'
import { printError } from '../utils/log.util'
import { configureConnection, getConnectionOptions } from '../connection'
import path from 'path';

interface IArgs {
  datasource: string;
  root: string;
  connection: string;
}

export class ConfigCommand implements yargs.CommandModule {
  command = 'config'
  describe = 'Show the TypeORM config'

  builder(args: yargs.Argv) {
    return args
      .option('d', {
        alias: 'datasource',
        default: '',
        describe: 'Name of the typeorm datasource file (json or js).',
      })
      .option('r', {
        alias: 'root',
        default: process.cwd(),
        describe: 'Path to your typeorm datasource file',
      })
  }

  async handler(args: yargs.Arguments<IArgs>) {
    const log = console.log
    const pkg = await readPackage({ cwd: path.join(process.cwd(), 'node_modules/typeorm-seedling') });
    log('🌱  ' + chalk.bold(`TypeORM Seeding v${(pkg as any).version}`))
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
