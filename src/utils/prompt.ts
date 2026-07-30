import { createInterface } from "node:readline";

export const prompt = async (question: string) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve: (answer: string) => void) => {
    rl.question(question, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
};
