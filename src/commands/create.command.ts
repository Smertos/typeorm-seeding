import chalk from "chalk";
import * as fs from 'fs';
import _ from 'lodash';
import ora, { Ora } from "ora";
import path from 'path';
import * as yargs from "yargs";
import { configureConnection, ConnectionOptions, getConnectionOptions } from "../connection.js";
import makeTemplate from "../templates/create-seeder.template.js";
import { panic, initCommand } from "../utils/command.util.js";


interface IArgs {
  connection?: string;
  datasource: string;
  fileName: string;
  root: string;
}

export class CreateCommand implements yargs.CommandModule<{}, IArgs> {
  command = 'create';
  describe = 'Creates a new seeder file';

  builder(args: yargs.Argv) {
    //
    return args
      .option('connection', {
        alias: 'c',
        describe: 'Name of the typeorm connection.',
        type: 'string',
      })
      .option('fileName', {
        alias: 'f',
        default: '',
        describe: 'Name of the seeder file to be created',
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
        describe: 'Path to your typeorm config file',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<IArgs>) {
    await initCommand();

    const spinner = ora('Loading ormconfig').start()
    const configureOption = {
      root: args.root,
      configName: args.datasource,
      connection: args.connection,
    }

    // Get TypeORM config file
    let option: ConnectionOptions
    try {
      configureConnection(configureOption)
      option = await getConnectionOptions() as ConnectionOptions;
      spinner.succeed('ORM Config loaded')

    } catch (error) {
      panic(spinner, error, 'Could not load the config file!');
    }

    let seedsDir = 'src/database/seeds';

    if(!option?.cli?.seedsDir) {
      return panic(spinner, new Error('NO_CLI_SEEDS_DIR'), 'cli.seedsDir was not set in the ormconfig file');
    } else {
      seedsDir = option.cli.seedsDir;
    }

    if(!args.fileName) {
      return panic(spinner, new Error('NO_FILE_NAME'), 'no filename entered, please use -f or --fileName to specify the filename');
    }

    spinner.start('Creating file');
    const now = Date.now();
    const fileName = `${now}-${_.kebabCase(args.fileName)}`;
    const className = `${_.upperFirst(_.camelCase(args.fileName))}${now}`;

    try {
      if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, {recursive: true});
      }
      fs.writeFileSync(path.join(seedsDir, fileName + '.ts'), makeTemplate({className}));
      spinner.succeed(`File: ${fileName}.ts created successfully`);
    } catch(error) {
      panic(spinner, error, 'Error creating file');
    }

    process.exit(0);

  }
}
