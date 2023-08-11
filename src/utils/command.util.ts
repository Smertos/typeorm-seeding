import chalk from 'chalk';
import { Ora } from 'ora';
import path from 'path';
import readPackage from 'read-pkg';

export async function initCommand(): Promise<typeof console.log> {
  const log = console.log;
  const pkg = await readPackage({ cwd: path.join(process.cwd(), 'node_modules/typeorm-seedling') });

  log('🌱  ' + chalk.bold(`TypeORM Seeding v${(pkg as any).version}`));

  return log;
}


export function panic(spinner: Ora, error: Error, message: string): never {
  spinner.fail(message);
  console.error(error);
  return process.exit(1);
}
