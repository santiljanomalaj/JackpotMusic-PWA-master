/**
 * Find the first index that meets the rule
 * @param array Elements to evaluate
 * @param evaluator Function that evaluate a rule
 * @returns Returns the first index that meets the rule or -1 if none are found
 */
export const findIndex = (array: Array<any>, evaluator: (current: any) => boolean): number => {
  if (Array.isArray(array) && array.length > 0) {
    for (let i = 0; i < array.length; i++) {
      const current = array[i];
      if (evaluator(current)) {
        return i;
      }
    }
  }
  return -1;
};
