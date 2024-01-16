import { validateFunctionName, log } from "./lib.mjs";
import { db } from "@/db.mjs";
import { nanoid } from "nanoid";

export async function run(functionName: string): Promise<string> {
  // this validation is duplicated at deployment time,
  // and our adversary is concretely the developer themselves
  // who puts the files in the filesystem (`rpc/`), but we validate
  // again for the sake of being paranoid
  if (!validateFunctionName(functionName)) {
    throw new Error("Invalid function name");
  }

  const id = nanoid();
  console.time(`rpc query ${functionName} ${id}`);
  const data = (await db(`SELECT "rpc_${functionName}"() as result`))[0].result;
  console.timeEnd(`rpc query ${functionName} ${id}`);

  if (data) {
    const res = JSON.parse(data) as {
      result: string;
      logs: ["log" | "debug" | "info" | "warn" | "error", string][];
    };
    log(res.logs);
    return res.result;
  } else {
    throw new Error("No data");
  }
}
