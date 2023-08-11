import type { ConnectionOptions } from './src/connection';

const connections: Array<ConnectionOptions> = [
    {
        name: 'default',
        type: 'sqlite',
        database: 'test.db',
        entities: ['sample/entities/**/*{.ts,.js}'],
        factories: ['sample/factories/**/*{.ts,.js}'],
        seeds: ['sample/seeds/**/*{.ts,.js}'],
    },
    {
        name: 'memory',
        type: 'sqlite',
        database: ':memory:',
        entities: ['sample/entities/**/*{.ts,.js}'],
        factories: ['sample/factories/**/*{.ts,.js}'],
        seeds: ['sample/seeds/**/*{.ts,.js}'],
    }
];

export default connections;
