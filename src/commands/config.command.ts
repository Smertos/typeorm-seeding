import * as yargs from 'yargs';
import { configureConnection, getConnectionOptions } from '../connection';
import { initCommand, panic } from '../utils/command.util';
import { ICommonArgs, setupCommonOptions } from './common';

interface IArgs extends ICommonArgs {}

export const configCommand: yargs.CommandModule<{}, IArgs> = {
  command: 'config',
  describe: 'Show the TypeORM config',

  builder(args: yargs.Argv): yargs.Argv<IArgs> {
    return setupCommonOptions(args);
  },

  async handler(args: yargs.ArgumentsCamelCase<IArgs>) {
    const log = await initCommand();

    try {
      configureConnection({
        root: args.root,
        configName: args.datasource,
        connection: args.connection,
      });

      const option = await getConnectionOptions();
      log(option);
    } catch (error) {
      panic(undefined, error, 'Could not find the orm config file', 111);
    }

    process.exit(0);
  }
};
