export const insertStringAndOrderAsNumber = (
  arr: string[],
  value
): string[] => {
  if (!isNaN(value)){
    arr.push("$ " + value);
  }  else  {
    arr.push(value);
  }
  return arr;
};
