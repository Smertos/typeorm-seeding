const makeTemplate = ({className}: {className: string}) => `/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-default-export */
import type { DataSource } from 'typeorm';
import type { Factory, Seeder } from 'typeorm-seedling';

export default class ${className} implements Seeder {
  public async run(_factory: Factory, _queryRunner: QueryRunner): Promise<any> {
    // add your logic here
    await queryRunner.query(\`Here goes your SQL query\`);
  }
}`;

export default makeTemplate;
