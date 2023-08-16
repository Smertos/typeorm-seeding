export async function runCommand(...args: Array<string>) {
  process.argv = ['node', 'cli.js', ...args];

  const { runCli } = require('../../src/cli');

  return runCli(args);
}

