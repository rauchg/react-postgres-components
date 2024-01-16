import { neon } from "@neondatabase/serverless";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const db = neon(process.env.POSTGRES_URL, {
  fetchOptions: {
    cache: "no-store",
  },
});
