import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

export const ask = async (query) => {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(query);
  rl.close();
  return answer;
};

export const inOrder = async (promises) => {
  const { results } = await promises.reduce(async (prevPromise, curPromise) => {
    const results = await prevPromise;
    const result = await curPromise;
    return [...results, result];
  }, Promise.resolve([]));
  return results;
};

export const previousYear = (date = new Date()) =>
  new Date(date.getFullYear() - 1, date.getMonth(), date.getDay());

export const endOfYear = (date) => new Date(date.getFullYear(), 12, 0);
