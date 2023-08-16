import 'reflect-metadata';
import { DataSource, ObjectType, QueryRunner } from 'typeorm';
import { configureConnection, ConfigureOption, createConnection, getConnectionOptions } from './connection';
import { EntityFactory } from './entity-factory';
import { EntityFactoryDefinition, Factory, FactoryFunction, Seeder, SeederConstructor } from './types';
import { getNameOfEntity } from './utils/factory.util';
import { importFiles, loadFiles } from './utils/file.util';

// -------------------------------------------------------------------------
// Handy Exports
// -------------------------------------------------------------------------

export * from './connection';
export { times } from './helpers';
export * from './importer';
export { Factory, Seeder } from './types';

(global as any).seeder = {
  entityFactories: new Map<string, EntityFactoryDefinition<any, any>>(),
};

// -------------------------------------------------------------------------
// Facade functions
// -------------------------------------------------------------------------

export const define = <Entity, Context>(entity: ObjectType<Entity>, factoryFn: FactoryFunction<Entity, Context>) => {
  ;(global as any).seeder.entityFactories.set(getNameOfEntity(entity), {
    entity,
    factory: factoryFn,
  });
};

export const factory: Factory = <Entity, Context>(entity: ObjectType<Entity>) => (context?: Context) => {
  const name = getNameOfEntity(entity);
  const entityFactoryObject = (global as any).seeder.entityFactories.get(name);

  return new EntityFactory<Entity, Context>(name, entity, entityFactoryObject?.factory, context);
};

export const runSeeder = async (queryRunner: QueryRunner, clazz: SeederConstructor): Promise<any> => {
  const seeder: Seeder = new clazz();

  return seeder.run(factory, queryRunner);
};

// -------------------------------------------------------------------------
// Facade functions for testing
// -------------------------------------------------------------------------
export const useRefreshDatabase = async (options: ConfigureOption = {}): Promise<DataSource> => {
  configureConnection(options);

  const option = await getConnectionOptions();
  const connection = await createConnection(option);

  if (connection && connection.isInitialized) {
    await connection.dropDatabase();
    await connection.synchronize();
  }

  return connection;
};

export const tearDownDatabase = async (): Promise<void> => {
  const connection = await createConnection();

  return connection && connection.isInitialized ? connection.close() : undefined;
};

export const useSeeding = async (options: ConfigureOption = {}): Promise<void> => {
  configureConnection(options);

  const option = await getConnectionOptions();
  const factoryFiles = loadFiles(option?.factories ?? []);

  await importFiles(factoryFiles);
};
