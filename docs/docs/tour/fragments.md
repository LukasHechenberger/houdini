---
title: 🧩 Fragments
---

Your components will want to make assumptions about which attributes are
available in your queries. To support this, Houdini uses GraphQL fragments embedded
within your component. Take, for example, a `UserAvatar` component that requires
the `profilePicture` field of a `User`:

```svelte
// components/UserAvatar.svelte

<script lang="ts">
    import { fragment, graphql, UserAvatar } from '$houdini'

    // the reference will get passed as a prop
    export let user: UserAvatar

    const data = fragment(graphql`
        fragment UserAvatar on User {
            profilePicture
        }
    `, user)
</script>

<img src={$data.profilePicture} />
```

This component can be rendered anywhere we want to query for a user, with a guarantee
that all necessary data has been asked for:

```svelte
// src/routes/users.svelte

<script>
    import { query, graphql, AllUsers } from '$houdini'
    import { UserAvatar } from 'components'

    const { data } = query<AllUsers>(graphql`
        query AllUsers {
            users {
                id
                ...UserAvatar
            }
        }
    `)
</script>

{#each $data.users as user}
    <UserAvatar user={user} />
{/each}
```

It's worth mentioning explicitly that a component can rely on multiple fragments
at the same time so long as the fragment names are unique and prop names are different.

### Fragment Arguments

In some situations it's necessary to configure the documents inside of a fragment. For example,
you might want to extend the `UserAvatar` component to allow for different sized profile pictures.
To support this, houdini provides two directives `@arguments` and `@with` which declare arguments
for a fragment and provide values, respectively.

Default values can be provided to fragment arguments with the `default` key:

```graphql
fragment UserAvatar on User @arguments(width: { type: "Int", default: 50 }) {
	profilePicture(width: $width)
}
```

In order to mark an argument as required, pass the type with a `!` at the end.
If no value is provided, an error will be thrown when generating your runtime.

```graphql
fragment UserAvatar on User @arguments(width: { type: "Int!" }) {
	profilePicture(width: $width)
}
```

Providing values for fragments is done with the `@with` decorator:

```graphql
query AllUsers {
	users {
		...UserAvatar @with(width: 100)
	}
}
```
