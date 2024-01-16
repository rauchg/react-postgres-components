import { dirname, basename } from "node:path";
import { deploy } from "./lib.mjs";
import { db } from "../db.mjs";
import { RPC_EXTENSIONS_REGEX } from "./constants.mjs";

const deploying = new Set();

export default async function RPCLoader() {
  const callback = this.async();

  // get the basename
  const functionsPath = dirname(this.resourcePath);
  const functionName = basename(this.resourcePath).replace(
    RPC_EXTENSIONS_REGEX,
    ""
  );

  if (!deploying.has(functionName)) {
    deploying.add(functionName);
    try {
      await deploy({
        db,
        functionsPath,
        functionName,
      });
    } catch (err) {
      return callback(err);
    }
  }

  callback(
    null,
    `"use server";
import { run } from "@/build/run-prod";

export default async function() {
  const res = await run("${functionName}");
  
  // we need something like RawHTML here
  // https://github.com/reactjs/rfcs/pull/129
  // otherwise we're creating an extra <div>
  // that the user is not defining
  return <div dangerouslySetInnerHTML={{ __html: res }} />;
}`
  );
}
