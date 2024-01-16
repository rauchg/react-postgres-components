import { build } from "esbuild";
import { join } from "node:path";
import bytes from "bytes";

/**
 * Bundles the function source with the RPC runtime
 *
 * @async
 * @exports
 * @function bundle
 * @param {Object} params - An object.
 * @param {string} params.functionName - A name of the function.
 * @param {string} params.functionsPath - A path where functions are stored.
 * @param {string} params.resolveDir - A directory to resolve the paths.
 * @returns {Promise} A promise that resolves when the build function completes.
 */
export async function bundle({ functionName, functionsPath, resolveDir }) {
  return await build({
    stdin: {
      contents: `
        _RPC_FUNCTION_NAME = "${functionName}";
        import "./runtime";
        import { renderToStaticMarkup } from "react-dom/server";
        import fn from "${functionsPath}/${functionName}";

        export default function () {
          const result = renderToStaticMarkup(fn());
          const logs = _RPC_LOGS;
          _RPC_LOGS = [];
          return JSON.stringify({
            result,
            logs,
          });
        }
      `,
      resolveDir,
      loader: "tsx",
    },
    bundle: true,
    minify: true,
    platform: "browser",
    jsx: "automatic",
    format: "iife",
    globalName: "__rpc",
    write: false,
  });
}

/**
 * Processes the buffer logs reported by the function inside
 * the PLV8 runtime environment
 *
 * @param {Array.<["log"|"debug"|"info"|"warn"|"error", string]>} logs - An array of tuples, each containing a log method ("log", "debug", "info", "warn", "error") and the message to be logged.
 * @returns {void}
 */
export function log(logs) {
  logs.forEach(([level, str]) => {
    console[level](str);
  });
}

/**
 * Validates the function name to be Postgres identifier
 * compatible when contemplating it's always prefixed by `rpc_`
 *
 * @param {string} functionName - The name of the function to validate.
 * @returns {boolean}
 */
export function validateFunctionName(functionName) {
  return /^[a-z0-9-_]+$/.test(functionName);
}

/**
 * Deploys the given `rpc/` function
 *
 * @async
 * @param {Object} options - The options for the deploy function.
 * @param {any} options.db - The database to be used.
 * @param {string} options.functionName - The name of the function to be deployed.
 * @param {string} options.functionsPath - The path to the functions to be deployed.
 *
 * @returns {Promise<void>} - Indicates the function has completed.
 */
export async function deploy({ db, functionName, functionsPath }) {
  const start = Date.now();
  console.log(`Building ${functionName}`);

  // only allow a-z, lowercase, numbers and dashes
  if (!validateFunctionName(functionName)) {
    throw new Error(
      `Invalid function name "${functionName}". Only a-z, lowercase, numbers, dashes or underscores are allowed.`
    );
  }

  if (`rpc_${functionName}`.length > 63) {
    throw new Error(
      `Function name "${functionName}" is too long. Maximum length is 59 characters.`
    );
  }

  const buildResult = await bundle({
    functionName,
    functionsPath,
    // at the moment, the easiest way to get to the build directory
    // is assuming `build/` is relative to `rpc/`, but that would
    // change if this project ever gets packaged ofc
    resolveDir: join(functionsPath, "../build"),
  });

  const functionCode =
    buildResult.outputFiles[0].text + `return __rpc.default();`;

  console.log(
    `Built ${functionName} (${bytes(Buffer.byteLength(functionCode))}) [${
      Date.now() - start
    }ms]`
  );
  const startDeploy = Date.now();

  // this is the equivalent of a "vercel alias"
  await db(
    `CREATE OR REPLACE FUNCTION "rpc_${functionName}"()
  RETURNS text AS $rpc$
    ${functionCode}
  $rpc$ LANGUAGE plv8 STRICT;`
  );

  console.log(`Deployed ${functionName} [${Date.now() - startDeploy}ms]`);
}
