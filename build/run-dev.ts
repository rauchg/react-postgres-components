import ivm from "isolated-vm";
import { db } from "../db.mjs";
import { join, dirname, normalize } from "path";
import { log, bundle } from "./lib.mjs";

export async function run(functionName: string): Promise<string> {
  if ("development" !== process.env.NODE_ENV) {
    throw new Error("This codepath is only available in development mode");
  }

  const sourceDir = getSourceDirectory();

  if (sourceDir === null) {
    throw new Error(
      "Could not find source directory. This is unexpected and might indicate a Next.js compatibility bug."
    );
  }

  const functionsPath = join(sourceDir, "rpc");
  const { isolate, context } = createIsolate();

  const buildResult = await bundle({
    functionName,
    functionsPath,
    resolveDir: join(sourceDir, "build"),
  });

  if (buildResult.errors.length > 0) {
    throw new Error(buildResult.errors.join("\n"));
  }

  if (buildResult.outputFiles.length !== 1) {
    throw new Error(
      `Expected exactly one output file, got ${buildResult.outputFiles.length}`
    );
  }

  const functionBundle = buildResult.outputFiles[0].text;

  const res = JSON.parse(
    await context.eval(`
    ${functionBundle}
    __rpc.default();
  `)
  );

  isolate.dispose();
  log(res.logs);
  return res.result;
}

function getSourceDirectory() {
  const subdir = ".next";

  // normalize string to remove '//' and make it work cross-platform
  let cleanStr = normalize(__dirname);

  let index = cleanStr.indexOf(normalize(subdir));
  if (index !== -1) {
    return dirname(cleanStr.substring(0, index + subdir.length));
  } else {
    return null;
  }
}

function createIsolate() {
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  const context = isolate.createContextSync();

  // a template tagged literal that calls `db.execute`
  async function query(sql: string, args: any[]) {
    return JSON.stringify(await db(sql, args));
  }

  context.evalClosureSync(
    `
  globalThis.plv8 = {
    execute: function(...args) {
      return JSON.parse(
        $0.applySyncPromise(undefined, args, { arguments: { copy: true }})
      );
    }
  }
  `,
    [query],
    { arguments: { reference: true }, result: { copy: true } }
  );

  return { isolate, context };
}
