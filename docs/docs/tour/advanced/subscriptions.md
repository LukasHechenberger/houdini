---
title: 🧾 Subscriptions
---

Subscriptions in houdini are handled with the `subscription` function exported by your runtime. This function
takes a tagged document, and returns a store with the most recent value returned by the server. Keep in mind
that houdini will keep the cache (and any subscribing components) up to date as new data is encountered.

It's worth mentioning that you can use the same fragments described in the [mutation section](#mutations)
in order to update houdini's cache with the response from a subscription.

Here is an example of a simple subscription from the example application included in this repo:

```svelte
<script lang="ts">
    import {
        fragment,
        mutation,
        graphql,
        subscription,
        ItemEntry_item,
    } from '$houdini'

    // the reference we're passed from our parents
    export let item: ItemEntry_item

    // get the information we need about the item
    const data = fragment(/* ... */)

    // since we're just using subscriptions to stay up to date, we don't care about the return value
    subscription(
        graphql`
            subscription ItemUpdate($id: ID!) {
                itemUpdate(id: $id) {
                    item {
                        id
                        completed
                        text
                    }
                }
            }
        `,
        {
            id: $data.id,
        }
    )
</script>

<li class:completed={$data.completed}>
    <div class="view">
        <input
            name={$data.text}
            class="toggle"
            type="checkbox"
            checked={$data.completed}
            on:click={handleClick}
        />
        <label for={$data.text}>{$data.text}</label>
        <button class="destroy" on:click={() => deleteItem({ id: $data.id })} />
    </div>
</li>
```

### Configuring the WebSocket client

Houdini can work with any websocket client as long as you can provide an object that satisfies
the `SubscriptionHandler` interface as the second argument to the Environment's constructor. Keep in mind
that WebSocket connections only exist between the browser and your API, therefor you must remember to
pass `null` when configuring your environment on the rendering server.

#### Using `graphql-ws`

If your API supports the [`graphql-ws`](https://github.com/enisdenjo/graphql-ws) protocol, you can create a
client and pass it directly:

```typescript
// environment.ts

import { createClient } from 'graphql-ws'
import { browser } from '$app/env'

// in sapper, this would be something like `(process as any).browser`
let socketClient = browser
	? new createClient({
			url: 'ws://api.url',
	  })
	: null

export default new Environment(fetchQuery, socketClient)
```

#### Using `subscriptions-transport-ws`

If you are using the deprecated `subscriptions-transport-ws` library and associated protocol,
you will have to slightly modify the above block:

```typescript
// environment.ts

import { SubscriptionClient } from 'subscriptions-transport-ws'
import { browser } from '$app/env'

let socketClient: SubscriptionHandler | null = null
if (browser) {
	// instantiate the transport client
	const client = new SubscriptionClient('ws://api.url', {
		reconnect: true,
	})

	// wrap the client in something houdini can use
	socketClient = {
		subscribe(payload, handlers) {
			// send the request
			const { unsubscribe } = client.request(payload).subscribe(handlers)

			// return the function to unsubscribe
			return unsubscribe
		},
	}
}

export default new Environment(fetchQuery, socketClient)
```
