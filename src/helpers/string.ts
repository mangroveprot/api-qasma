export const escapeRegex = (text: string): string => {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const stringifyObject = (obj: any): string => {
  const keys = Object.keys(obj).sort();
  const sortedObj = keys.map((key) => `${key}:${obj[key]}`); // Convert to "key:value" format
  return `{${sortedObj.join(',')}}`;
};

export const parseStringifiedObject = (str: string): any => {
  // Remove the curly braces from the string
  const strippedStr = str.slice(1, -1);
  const keyValuePairs = strippedStr.split(',');
  const obj: { [key: string]: any } = {};
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split(':');
    obj[key] = value;
  });

  return obj;
};
