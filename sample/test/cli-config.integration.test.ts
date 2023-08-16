import path from 'path';
import { runCommand } from './commmon';

describe('cli config', () => {
  let originalArgv: typeof process.argv;
  let originalPwd: string;

  let configCommand;

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

    jest.mock('../../src/commands/config.command');
    configCommand = require('../../src/commands/config.command').configCommand;

    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;
  });

  afterEach(() => {
    // Set process arguments back to the original value
    process.argv = originalArgv;
  });

  it('should run config command', async () => {
    const datasource = 'ormconfig.ts';
    const connection = 'memory';
    const parsedArgs = await runCommand('config', '--datasource', datasource, '--connection', connection);

    expect(parsedArgs).toHaveProperty('connection', connection);
    expect(parsedArgs).toHaveProperty('datasource', datasource);
  });
});
