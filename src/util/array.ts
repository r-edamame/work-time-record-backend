export const removeWithIndicies = <T>(arr: readonly T[], ixes: number[]): T[] => {
  return arr.flatMap((e, ix) => {
    return ixes.includes(ix) ? [] : [e];
  });
};
