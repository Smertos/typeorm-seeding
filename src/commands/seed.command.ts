import chalk from 'chalk';
import ora, { Ora } from 'ora';
import * as yargs from 'yargs';
import { ConnectionOptions, createConnection } from '../connection';
import { importSeed } from '../importer';
import { runSeeder } from '../typeorm-seeding';
import { initCommand, panic } from '../utils/command.util';
import { importFiles, loadFiles } from '../utils/file.util';
import { logToSeedTable } from '../utils/log-to-seed-table.util';
import { createSeedTable, getExecutedSeeds, ISeedTable } from './../utils/seed-table.util';
import { ICommonArgs, setupCommonOptions, stageLoadOrmConfig } from './common';

interface IArgs extends ICommonArgs {
  seed?: string;
}

async function stageImportFactories(spinner: Ora, connectionOptions: ConnectionOptions): Promise<void> {
  spinner.start('Import Factories');

  const factoryFiles = loadFiles(connectionOptions.factories ?? []);

  try {
    await importFiles(factoryFiles);
    spinner.succeed('Factories are imported');
  } catch (error) {
    panic(spinner, error, 'Could not import factories!', 131);
  }
}

async function stageImportSeeds(spinner: Ora, connectionOptions: ConnectionOptions): Promise<Array<any>> {
  spinner.start('Importing Seeders');

  let seedFiles = loadFiles(connectionOptions.seeds ?? []);
  seedFiles = seedFiles.sort((fileName1, fileName2) => fileName1.localeCompare(fileName2));

  let seedFileObjects: any[] = [];

  try {
    seedFileObjects = await Promise.all(seedFiles.map((seedFile) => importSeed(seedFile)))
    spinner.succeed('Seeders are imported');

    return seedFileObjects;
  } catch (error) {
    panic(spinner, error, 'Could not import seeders!', 132);
  }
}

async function stageConnectToDatabase(spinner: Ora): Promise<void> {
  spinner.start('Connecting to the database');

  try {
    await createConnection();

    spinner.succeed('Database connected');
  } catch (error) {
    panic(spinner, error, 'Database connection failed! Check your typeORM config file.', 133);
  }
}

async function stageCreateSeedsTable(
  spinner: Ora,
  args: yargs.ArgumentsCamelCase<IArgs>,
  connectionOptions: ConnectionOptions,
  seedFileObjects: Array<any>
): Promise<Array<any>> {
  spinner.start('Get Executed Seeders & filter seed classes');
  let seedsAlreadyRan: Array<ISeedTable> = [];

  try {
    const connection = await createConnection(connectionOptions);
    const queryRunner = connection.createQueryRunner();

    await createSeedTable(queryRunner, connectionOptions);

    seedsAlreadyRan = await getExecutedSeeds(connectionOptions);

    const seedRanNames = seedsAlreadyRan.map(sar => sar.className);

    const filteredSeedFileObjects = seedFileObjects
      .map(sfo => sfo?.default ? sfo.default : sfo)
      .filter(sfo => !seedRanNames.includes(sfo.name) || (args.seed && args.seed === sfo.name));

    spinner.succeed(`Finish Getting Seeders. ${seedsAlreadyRan.length} seeders already ran, ${seedFileObjects.length} seeders are ready to be executed`);

    return filteredSeedFileObjects;
  } catch(error) {
    panic(spinner, error, 'Error getting executed seeders', 134);
  }
}

async function stageExecuteSeeds(spinner: Ora, connectionOptions: ConnectionOptions, seedFileObjects: Array<any>): Promise<void> {
  for (const seedFileObject of seedFileObjects) {
    spinner.start(`Executing ${seedFileObject.name} Seeder`)

    const connection = await createConnection(connectionOptions);
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.startTransaction();
    } catch (error) {
      panic(spinner, error, 'Failed to begin transaction', 135);
    }

    try {
      await runSeeder(queryRunner, seedFileObject)
      await logToSeedTable(queryRunner, seedFileObject.name, connectionOptions)

      spinner.succeed(`Seeder ${seedFileObject.name} executed`)
    } catch (error) {
      panic(spinner, error, `Could not run the seed ${seedFileObject.name}!`, 136)
    }

    try {
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}

export const seedCommand: yargs.CommandModule<{}, IArgs> = {
  command: 'seed',
  describe: 'Runs the seeds',

  builder(args: yargs.Argv): yargs.Argv<IArgs> {
    return setupCommonOptions(args)
      .option('seed', {
        alias: 's',
        describe: 'Specific seed class to run.',
        type: 'string',
      });
  },

  async handler(args: yargs.ArgumentsCamelCase<IArgs>): Promise<void> {
    const log = await initCommand();
    const spinner = ora('Loading ormconfig').start()

    // Get TypeORM config file
    const connectionOptions = await stageLoadOrmConfig(spinner, args);

    // Find all factories and seed with help of the config
    await stageImportFactories(spinner, connectionOptions);

    // Find all seeds and load them
    let seedFileObjects: any[] = await stageImportSeeds(spinner, connectionOptions);

    // Get database connection and pass it to the seeder
    await stageConnectToDatabase(spinner);

    // Create Seed table if not exists
    seedFileObjects = await stageCreateSeedsTable(spinner, args, connectionOptions, seedFileObjects);

    // Run seeds
    await stageExecuteSeeds(spinner, connectionOptions, seedFileObjects);

    log('👍 ', chalk.gray.underline(`Finished Seeding`));
    process.exit(0);
  }
};

