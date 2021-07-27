---
title: Setup
---

## Installation

houdini is available on npm.

```sh
yarn add -D houdini houdini-preprocess
# or
npm install --save-dev houdini houdini-preprocess
```

## Configuring Your Application

Adding houdini to an existing project can easily be done with the provided command-line tool.
If you don't already have an existing app, visit [this link](https://kit.svelte.dev/docs)
for help setting one up. Once you have a project and want to add houdini, execute the following command:

```sh
npx houdini init
```

This will create a few necessary files, as well as pull down a json representation of
your API's schema. Next, generate your runtime:

```sh
npx houdini generate
```

and finally, add the preprocessor to your setup.

```typescript
import houdini from 'houdini-preprocess'

// somewhere in your config file
{
	plugins: [
		svelte({
			preprocess: [houdini()],
		}),
	]
}
```

### Sapper

Remember, you'll have to add the configuration to your server
and client configs. With that in place, the only thing left to configure your Sapper application is
to connect your client and server to the generate network layer:

```typescript
// in both src/client.js and src/server.js

import { setEnvironment } from '$houdini'
import env from './environment'

setEnvironment(env)
```

### SvelteKit

We need to define an alias so that your codebase can import the generated runtime. Add the following
values to `svelte.config.js`:

```typescript
{
	kit: {
		vite: {
			resolve: {
				alias: {
					$houdini: path.resolve('.', '$houdini')
				}
			}
		}
	}
}
```

And finally, we need to configure our application to use the generated network layer. To do
this, add the following block of code to `src/routes/__layout.svelte`:

```typescript
<script context="module">
	import env from '../environment'; import {setEnvironment} from '$houdini'; setEnvironment(env);
</script>
```

You might need to generate your runtime in order to fix typescript errors.
