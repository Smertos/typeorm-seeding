import * as fs from 'fs';
import { camelCase, kebabCase, upperFirst } from 'lodash/fp';
import ora, { Ora } from 'ora';
import path from 'path';
import * as yargs from 'yargs';
import { ConnectionOptions } from '../connection.js';
import makeTemplate from '../templates/create-seeder.template';
import { initCommand, panic } from '../utils/command.util';
import { ICommonArgs, setupCommonOptions, stageLoadOrmConfig } from './common';


interface IArgs extends ICommonArgs {
  fileName: string;
}

function stageCreateSeed(spinner: Ora, args: yargs.ArgumentsCamelCase<IArgs>, seedsDir: string): void {
    spinner.start('Creating file');

    const now = Date.now();
    const fileName = `${now}-${kebabCase(args.fileName)}`;
    const className = `${upperFirst(camelCase(args.fileName))}${now}`;

    try {
      if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, {recursive: true});
      }

      fs.writeFileSync(path.join(seedsDir, fileName + '.ts'), makeTemplate({className}));
    } catch(error) {
      panic(spinner, error, 'Error creating file', 121);
    }

    spinner.succeed(`File: ${fileName}.ts created successfully`);
}

export const createCommand: yargs.CommandModule<{}, IArgs> = {
  command: 'create',
  describe: 'Creates a new seeder file',

  builder(args: yargs.Argv): yargs.Argv<IArgs> {
    return setupCommonOptions(args)
      .option('fileName', {
        alias: 'f',
        default: '',
        describe: 'Name of the seeder file to be created',
        type: 'string',
      });
  },

  async handler(args: yargs.ArgumentsCamelCase<IArgs>) {
    await initCommand();

    const spinner = ora('Loading ormconfig').start();

    // Get TypeORM config file
    const option: ConnectionOptions = await stageLoadOrmConfig(spinner, args);

    let seedsDir = 'src/database/seeds';

    if(!option?.cli?.seedsDir) {
      return panic(spinner, new Error('NO_CLI_SEEDS_DIR'), 'cli.seedsDir was not set in the ormconfig file', 122);
    } else {
      seedsDir = option.cli.seedsDir;
    }

    if(!args.fileName) {
      return panic(spinner, new Error('NO_FILE_NAME'), 'no filename entered, please use -f or --fileName to specify the filename', 123);
    }

    stageCreateSeed(spinner, args, seedsDir);

    process.exit(0);
  }
};
