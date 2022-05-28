/** is dict */
const isDict = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any
) => Object.prototype.toString.call(obj) === '[object Object]';

/** deepAssign / 深度賦值 */
export const deepAssign = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: Array<Array<any> | { [k: string | number | symbol]: any }>
) => {
  if (args.length < 2) return args[0];
  let result = args[0];
  args.shift();
  args.forEach((item) => {
    if (isDict(item)) {
      if (!isDict(result)) result = {};
      for (const key in item) {
        if (
          result[key] &&
          (isDict(result[key]) || item[key] instanceof Array)
        ) {
          result[key] = deepAssign(result[key], item[key]);
        } else result[key] = item[key];
      }
    } else if (item instanceof Array) {
      if (!(result instanceof Array)) result = [];
      item.forEach((arrItem, arrIndex) => {
        if (isDict(arrItem)) {
          result[arrIndex] = deepAssign(result[arrIndex]);
        } else result[arrIndex] = arrItem;
      });
    }
  });
  return result;
};
