import { createInterface } from "node:readline";
import { defineCommand, runMain } from "citty";
import { runRtmp } from "./rtmp.ts";
import { runHttp } from "./http.ts";
import pkg from "../package.json";

const promptToken = async (): Promise<string> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Ingresar Tunnel Token: ", (answer) => {
      resolve(answer);
    });
  });
};

const main = defineCommand({
  meta: {
    name: pkg.name,
    version: pkg.version
  },
  args: {
    token: {
      type: "string",
      description: "Tunnel token",
      required: false
    }
  },
  async run ({ args }) {
    try {
      const token = args.token || await promptToken();
      if (token) {
        runHttp();
        await runRtmp(token);
      }
    }
    catch (err) {
      console.error(err);
    }
  }
});

runMain(main);
