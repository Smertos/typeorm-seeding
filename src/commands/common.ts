import { Ora } from 'ora';
import yargs from 'yargs';
import { configureConnection, ConnectionOptions, getConnectionOptions } from '../connection';
import { panic } from '../utils/command.util';

export interface ICommonArgs {
  connection?: string;
  datasource: string;
  root: string;
}

export async function stageLoadOrmConfig<T extends ICommonArgs>(spinner: Ora, args: yargs.ArgumentsCamelCase<T>): Promise<ConnectionOptions> {
  const configureOption = {
    configName: args.datasource,
    connection: args.connection,
    root: args.root,
  };

  try {
    configureConnection(configureOption);
    const option = await getConnectionOptions();
    spinner.succeed('ORM Config loaded');

    return option;
  } catch (error) {
    panic(spinner, error, 'Could not load the config file!');
  }
}

export function setupCommonOptions(args: yargs.Argv): yargs.Argv<ICommonArgs> {
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
    });
}
