import { basename } from "path";
import { RPC_EXTENSIONS_REGEX } from "./constants.mjs";

export default function RPCLoader() {
  // get the basename
  const functionName = basename(this.resourcePath).replace(
    RPC_EXTENSIONS_REGEX,
    ""
  );

  return `"use server";
import { run } from "@/build/run-dev";

export default async function() {
  const res = await run("${functionName}");
  
  // we need something like RawHTML here
  // https://github.com/reactjs/rfcs/pull/129
  // otherwise we're creating an extra <div>
  // that the user is not defining
  return <div dangerouslySetInnerHTML={{ __html: res }} />;
}`;
}
