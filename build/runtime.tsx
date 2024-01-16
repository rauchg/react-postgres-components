import TextEncoderPolyfill from "fastestsmallesttextencoderdecoder";

declare var plv8: any;
declare var sql: any;
declare var _RPC_LOGS: any[];
declare var TextEncoder: any;
declare var console: any;

if ("function" !== typeof TextEncoder) {
  TextEncoder = TextEncoderPolyfill.TextEncoder;
}

// at the moment our runtime solely consists of a plv8 wrapper
if ("undefined" === typeof sql) {
  sql = function sql(strings: string[], ...values: any[]) {
    // imterleave the strings with the substitution expressions
    const query = strings.reduce((result, string, i) => {
      return result + (i > 0 ? `$${i}` : "") + string;
    }, "");

    // pass the SQL query and the values to `plv8.execute`
    return plv8.execute(query, values);
  };
}

// a logging convenience

// we must be careful not to overwrite the buffer in
// the case of functions calling other functions,
// which will share the same global scope
_RPC_LOGS = typeof _RPC_LOGS === "undefined" ? [] : _RPC_LOGS;

console = {
  ...(console || {}),

  log(...args: any[]) {
    const text = args.join(" ");
    _RPC_LOGS.push(["log", text]);
  },

  error(...args: any[]) {
    const text = args.join(" ");
    _RPC_LOGS.push(["error", text]);
  },

  warn(...args: any[]) {
    const text = args.join(" ");
    _RPC_LOGS.push(["warn", text]);
  },

  info(...args: any[]) {
    const text = args.join(" ");
    _RPC_LOGS.push(["info", text]);
  },

  debug(...args: any[]) {
    const text = args.join(" ");
    _RPC_LOGS.push(["debug", text]);
  },
};
