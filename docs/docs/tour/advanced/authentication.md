---
title: Authentication
---

houdini defers to SvelteKit's sessions for authentication. Assuming that the session has been populated
somehow, you can access it through the second argument in the environment definition:

```typescript
//src/environment.ts

import { Environment } from '$houdini'

// this function can take a second argument that will contain the session
// data during a request or mutation
export default new Environment(async function ({ text, variables = {} }, session) {
	const result = await this.fetch('http://localhost:4000', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: session.token ? `Bearer ${session.token}` : null,
		},
		body: JSON.stringify({
			query: text,
			variables,
		}),
	})

	// parse the result as json
	return await result.json()
})
```
