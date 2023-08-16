import { QueryRunner, Table } from 'typeorm';
import { createConnection, ConnectionOptions } from './../connection';
import { queryQuote } from './query-quote.util';

function getCompatableTimestampColumnType(options: ConnectionOptions): string {
  if (options.type === 'mssql') {
    return 'datetime';
  }

  if (options.type === 'postgres') {
    return 'timestampz';
  }

  return 'timestamp';
}

export interface ISeedTable {
  className: string;
  ran_at: Date;
}

export const createSeedTable = async (queryRunner: QueryRunner, options: ConnectionOptions) => {
  await queryRunner.createTable(
    new Table({
      name: options.seedsTableName || 'typeorm_seeds',
      columns: [
        {
          name: 'className',
          type: 'varchar',
          isUnique: true,
          isNullable: true,
        },
        {
          name: 'ran_at',
          type: getCompatableTimestampColumnType(options),
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    }),
    true,
  );
};

export const getExecutedSeeds = async (options: ConnectionOptions) => {
  const connection = await createConnection(options);
  const tableName = queryQuote(options, options.seedsTableName || 'typeorm_seeds');

  return await connection.query(`select * from ${tableName}`);
};
