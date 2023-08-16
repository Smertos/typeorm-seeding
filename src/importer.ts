import { SeederConstructor } from './types';

type SeedFileObject = { [key: string]: SeederConstructor };

export const importSeed = async (filePath: string): Promise<SeederConstructor> => {
  const seedFileObject: SeedFileObject = await import(filePath);
  const keys = Object.keys(seedFileObject);

  return seedFileObject[keys[0]];
}
