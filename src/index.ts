import { defineCommand, runMain } from "citty";
import { consola } from "consola";
import { runRtmp } from "./rtmp.ts";
import { runHttp } from "./http.ts";
import { Workspace } from "./utils/workspace.ts";
import { isValidToken } from "./utils/token-validator.ts";
import { pressAnyKey } from "./utils/press-any-key.ts";
import { APP, checkForUpdates } from "./utils/app.ts";

const main = defineCommand({
  meta: {
    name: APP.name,
    version: APP.version
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
    consola.info(`Ejecutando ${APP.name} v${APP.version}`);
    try {
      consola.start("Configurando entorno...");
      const workspace = await Workspace.setup(APP.name);

      if (!args.dev) {
        const { isUpdateAvailable, updateApp } = await checkForUpdates();
        if (isUpdateAvailable && (await consola.prompt("¿Desea actualizar a la última versión?", {
          type: "select",
          initial: "Y",
          options: [
            { label: "Sí", value: "Y", hint: "Se descargará la última versión" },
            { label: "No", value: "N", hint: "Se continuará con la versión actual" }
          ]
        })) === "Y") {
          await updateApp();
        }
      }

      const cachedToken = await workspace.cache.read("token.txt");
      const token = args.dev ? undefined : (
        args.token || cachedToken || await consola.prompt("Ingresar Tunnel Token: ", { type: "text" })
      );

      if (token && !isValidToken(token)) {
        workspace.cache.delete("token.txt");
        consola.error("El token no es válido. Cierra el programa y vuelve a ejecutar con un token válido.");
        consola.info("Presione cualquier tecla para salir...");
        await pressAnyKey();
        process.exit(1);
      }

      if (!args.dev && !cachedToken && token) {
        const remember = args.remember || (
          await consola.prompt("¿Desea recordar el token?", {
            type: "select",
            initial: "Y",
            options: [
              { label: "Sí", value: "Y", hint: "Se almacenará el token en caché" },
              { label: "No", value: "N", hint: "Tendrá que ingresar el token cada ejecución" }
            ]
          })
        ) === "Y";

        if (remember) {
          await workspace.cache.write("token.txt", token);
        }
      }

      runHttp({ port: 8080 });
      await runRtmp({
        host: "127.0.0.1",
        port: 5740,
        cloudflared: args.dev || !token ? undefined : { token }
      });
    }
    catch (err) {
      console.error(err);
    }
  }
});

runMain(main);
