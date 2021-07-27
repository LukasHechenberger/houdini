---
title: 🚀 Fetching Data
---

## Fetching Data

Grabbing data from your API is done with the `query` function:

```svelte
<script lang="ts">
    import { query, graphql, AllItems } from '$houdini'

    // load the items
    const { data } = query<AllItems>(graphql`
        query AllItems {
            items {
                id
                text
            }
        }
    `)
</script>

{#each $data.items as item}
    <div>{item.text}</div>
{/each}
```

### Query variables and page data

At the moment, query variables are declared as a function in the module context of your component.
This function must be named after your query and in a sapper application, it takes the same arguments
that are passed to the `preload` function described in the [Sapper](https://sapper.svelte.dev/docs#Pages)
documentation. In a SvelteKit project, this function takes the same arguments passed to the `load` function
described in the [SvelteKit](https://kit.svelte.dev/docs#Loading) docs. Regardless of the framework, you can return
the value from `this.error` and `this.redirect` in order to change the behavior of the response. Here is a
modified example from the [demo](./example):

```svelte
// src/routes/[filter].svelte

<script lang="ts">
    import { query, graphql, AllItems } from '$houdini'

    // load the items
    const { data } = query<AllItems>(graphql`
        query AllItems($completed: Boolean) {
            items(completed: $completed) {
                id
                text
            }
        }
    `)
</script>

<script context="module" lang="ts">
    // This is the function for the AllItems query.
    // Query variable functions must be named <QueryName>Variables.
    export function AllItemsVariables(page): AllItems$input {
        // make sure we recognize the value
        if (!['active', 'completed'].includes(page.params.filter)) {
            return this.error(400, "filter must be one of 'active' or 'completed'")
        }

        return {
            completed: page.params.filter === 'completed',
        }
    }
</script>

{#each $data.items as item}
    <div>{item.text}</div>
{/each}
```

### Loading State

The methods used for tracking the loading state of your queries changes depending
on the context of your component. For queries that live in routes (ie, in
`/src/routes/...`), the actual query happens in a `load` function as described
in [What about load?](#what-about-load). Because of this, the best way to track
if your query is loading is to use the
[navigating store](https://kit.svelte.dev/docs#modules-$app-stores) exported from `$app/stores`:

```svelte
// src/routes/index.svelte

<script>
    import { query } from '$houdini'
    import { navigating } from '$app/stores'

    const { data } = query(...)
</script>

{#if $navigating}
    loading...
{:else}
    data is loaded!
{/if}
```

However, since queries inside of non-route components (ie, ones that are not defined in `/src/routes/...`)
do not get hoisted to a `load` function, the recommended practice to is use the store returned from
the result of query:

```svelte
// src/components/MyComponent.svelte

<script>
    import { query } from '$houdini'

    const { data, loading } = query(...)
</script>

{#if $loading}
    loading...
{:else}
    data is loaded!
{/if}
```

### Refetching Data

Refetching data is done with the `refetch` function provided from the result of a query:

```svelte

<script lang="ts">
    import { query, graphql, AllItems } from '$houdini'

    // load the items
    const { refetch } = query<AllItems>(graphql`
        query AllItems($completed: Boolean) {
            items(completed: $completed) {
                id
                text
            }
        }
    `)

    let completed = true

    $: refetch({ completed })
</script>

<input type=checkbox bind:checked={completed}>
```

### What about `load`?

Don't worry - that's where the preprocessor comes in. One of its responsibilities is moving the actual
fetch into a `load`. You can think of the block at the top of this section as equivalent to:

```svelte
<script context="module">
    export async function load() {
            return {
                _data: await this.fetch({
                    text: `
                        query AllItems {
                            items {
                                id
                                text
                            }
                        }
                    `
                }),
            }
    }
</script>

<script>
    export let _data

    const data = readable(_data, ...)
</script>

{#each $data.items as item}
    <div>{item.text}</div>
{/each}
```
