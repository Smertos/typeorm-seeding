import path from 'path';
import { runCommand } from './commmon';

describe('cli create', () => {
  let originalArgv: typeof process.argv;
  let originalPwd: string;

  let createCommand;

  beforeAll(() => {
    originalPwd = process.cwd();

    process.chdir(path.resolve(__dirname, '../..'));
  });

  afterAll(() => {
    process.chdir(originalPwd);
  });

  beforeEach(() => {
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    jest.resetModules();
    jest.resetAllMocks();

    jest.mock('../../src/commands/create.command');
    createCommand = require('../../src/commands/create.command').createCommand;

    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;
  });

  afterEach(() => {
    // Set process arguments back to the original value
    process.argv = originalArgv;
  });

  it('should run create command', async () => {
    const datasource = 'ormconfig.ts';
    const connection = 'create_test';
    const fileName = 'test';
    const parsedArgs = await runCommand('create', '--datasource', datasource, '--connection', connection, '--fileName', fileName);

    expect(parsedArgs).toHaveProperty('connection', connection);
    expect(parsedArgs).toHaveProperty('datasource', datasource);
    expect(parsedArgs).toHaveProperty('fileName', fileName);
  });
});
