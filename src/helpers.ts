/**
 * Times repeats a function n times
 */
export const times = async <TResult>(n: number, iteratee: (index: number) => Promise<TResult>): Promise<TResult[]> => {
  const results = [] as TResult[];

  for (let i = 0; i < n; i++) {
    const r = await iteratee(i);
    results.push(r);
  }

  return results;
};
