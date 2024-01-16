## react-postgres-components

<a href="https://react-postgres-components.vercel.app/">
<img src="https://github.com/rauchg/react-postgres-components/assets/13041/7b3b83ec-15b5-4aa5-a61c-3f5e6257e424" width="300" />
</a>

An experiment on deploying remote functions that run inside Postgres using v8, run React SSR, and are easily defined in a `rpc/` directory.

```js
export default function helloWorld () => {
  const [{version}] = sql`SELECT version()`; // no `await` needed!
  return <h1>Hello from <em>inside</em> Postgres: {version}</h1>;
}
```

Check out the [demos & how it works](https://react-postgres-components.vercel.app/).

### Deployment

- Make sure the Vercel project is connected to a Vercel Postgres (Neon) database.
- Deploy!

### Local dev

- Run `vc env pull` to get a `.env.local` file with the `POSTGRES_URL` credential
- Run `pnpm dev` to start developing

### License & Credit

- MIT licensed
- Elephant icon by [Lima Studio](https://www.svgrepo.com/svg/423868/elephant-origami-paper) (CC Attribution)
- Pokeball icon by [Tiny Brand Icons](https://www.svgrepo.com/svg/315521/pokemon) (MIT)
