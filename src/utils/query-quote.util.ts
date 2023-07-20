import { ConnectionOptions } from "../connection";

export function queryQuote(options: ConnectionOptions, whatever: any): string {
  const connectionType = options.type;

  if (connectionType === 'mssql') {
    return `[${whatever}]`;
  }

  return `\`${whatever}\``;
}

export function queryQuoteString(options: ConnectionOptions, whatever: any): string {
  const connectionType = options.type;

  if (connectionType === 'mssql') {
    return `N'${whatever}'`;
  }

  return `'${whatever}'`;
}
