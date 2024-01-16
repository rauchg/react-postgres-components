export default function Pokemon() {
  const list = sql`SELECT * FROM pokemon ORDER BY RANDOM() LIMIT 12`;
  return (
    <ul className="flex flex-wrap justify-center gap-4">
      {list.map((row: any) => {
        return (
          <li className="inline-flex flex-col items-center justify-center border bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500 p-3">
            <img
              alt={row.name}
              width={96}
              height={96}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${row.id}.png`}
            />
            {row.name}
          </li>
        );
      })}
    </ul>
  );
}
