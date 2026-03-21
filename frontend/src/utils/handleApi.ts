export async function handleApi(fn: (...args: any[]) => any, ...args: any[]) {
  return fn(...args);
}
