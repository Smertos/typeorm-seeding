import { createConnection } from './../connection';
import { ConnectionOptions } from "../connection.js";
import { queryQuote, queryQuoteString } from './query-quote.util';
import { QueryRunner } from 'typeorm';


export const logToSeedTable = async (queryRunner: QueryRunner, seederName: string, options: ConnectionOptions) => {
  const tableName = queryQuote(options, options.seedsTableName || 'typeorm_seeds')
  const seederNameQuoted = queryQuoteString(options, seederName);

  return await queryRunner.query(`insert into ${tableName} (className) values (${seederNameQuoted})`)
}
