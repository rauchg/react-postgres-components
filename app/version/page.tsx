import PostgresVersion from "@/rpc/postgres-version";

export const dynamic = "force-dynamic";

export default function Version() {
  return <PostgresVersion />;
}
