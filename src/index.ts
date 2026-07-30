import { defineCommand, runMain } from "citty";
import pkg from "../package.json" with { type: "json" };
import { runRtmp } from "./rtmp.ts";
import { runHttp } from "./http.ts";
import { Workspace } from "./utils/workspace.ts";
import { prompt } from "./utils/prompt.ts";

const main = defineCommand({
  meta: {
    name: pkg.name,
    version: pkg.version
  },
  args: {
    token: {
      type: "string",
      description: "Cloudflare Tunnel token",
      required: false
    },
    dev: {
      type: "boolean",
      description: "Run without Cloudflare Tunnel",
      required: false
    },
    remember: {
      type: "boolean",
      description: "Remember the token for future runs",
      required: false
    }
  },
  async run ({ args }) {
    console.info(`Starting ${pkg.name} v${pkg.version}...`);
    try {
      const workspace = await Workspace.setup("jim-rtmp");

      const cachedToken = await workspace.cache.read("token.txt");
      const token = args.token || cachedToken || await prompt("Ingresar Tunnel Token: ");

      if (!args.dev && !cachedToken && token) {
        const shouldRemember = args.remember || (
          await prompt("¿Desea recordar el token? (Y/n): ")
        ).trim().toLowerCase() !== "n";

        if (shouldRemember) {
          await workspace.cache.write("token.txt", token);
        }
      }

      runHttp({ port: 8080 });
      await runRtmp({ port: 5740, token: args.dev ? undefined : token });
    }
    catch (err) {
      console.error(err);
    }
  }
});

runMain(main);
