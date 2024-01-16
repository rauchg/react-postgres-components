export default function postgresVersion() {
  const [{ version }] = sql`SELECT version()`; // no `await` needed!
  return (
    <h1>
      Hello from <em>inside</em> Postgres: {version}
    </h1>
  );
}
