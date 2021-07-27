---
title: Mutations
---

Mutations are defined in your component like the rest of the documents but
instead of triggering a network request when called, you get a function
which can be invoked to execute the mutation. Here's another modified example from
[the demo](./example):

```svelte
<script lang="ts">
    import { mutation, graphql, UncheckItem } from '$houdini'

    let itemID: string

    const uncheckItem = mutation<UncheckItem>(graphql`
        mutation UncheckItem($id: ID!) {
            uncheckItem(item: $id) {
                item {
                    id
                    completed
                }
            }
        }
    `)
</script>

<button on:click={() => uncheckItem({ id: itemID })}>
    Uncheck Item
</button>
```

Note: mutations usually do best when combined with at least one fragment grabbing
the information needed for the mutation (for an example of this pattern, see below.)

### Updating fields

When a mutation is responsible for updating fields of entities, houdini
should take care of the details for you as long as you request the updated data alongside the
record's id. Take for example, an `TodoItemRow` component:

```svelte
<script lang="ts">
    import { fragment, mutation, graphql, TodoItemRow } from '$houdini'

    export let item: TodoItemRow

    // the resulting store will stay up to date whenever `checkItem`
    // is triggered
    const data = fragment(
        graphql`
            fragment TodoItemRow on TodoItem {
                id
                text
                completed
            }
        `,
        item
    )

    const checkItem = mutation<CompleteItem>(graphql`
        mutation CompleteItem($id: ID!) {
            checkItem(item: $id) {
                item {
                    id
                    completed
                }
            }
        }
    `)
</script>

<li class:completed={$data.completed}>
    <input
        name={$data.text}
        class="toggle"
        type="checkbox"
        checked={$data.completed}
        on:click={handleClick}
    />
    <label for={$data.text}>{$data.text}</label>
    <button class="destroy" on:click={() => deleteItem({ id: $data.id })} />
</li>
```

### Lists

Adding and removing records from a list is done by mixing together a few different generated fragments
and directives. In order to tell the compiler which lists are targets for these operations, you have to
mark them with the `@list` directive and provide a unique name:

```graphql
query AllItems {
	items @list(name: "All_Items") {
		id
	}
}
```

It's recommended to name these lists with a different casing convention than the rest of your
application to distinguish the generated fragments from those in your codebase.

#### Inserting a record

With this field tagged, any mutation that returns an `Item` can be used to insert items in this list:

```graphql
mutation NewItem($input: AddItemInput!) {
	addItem(input: $input) {
		...All_Items_insert
	}
}
```

#### Removing a record

Any mutation that returns an `Item` can also be used to remove an item from the list:

```graphql
mutation RemoveItem($input: RemoveItemInput!) {
	removeItem(input: $input) {
		...All_Items_remove
	}
}
```

#### Deleting a record

Sometimes it can be tedious to remove a record from every single list that mentions it.
For these situations, Houdini provides a directive that can be used to mark a field in
the mutation response holding the ID of a record to delete from all lists.

```graphql
mutation DeleteItem($id: ID!) {
	deleteItem(id: $id) {
		itemID @Item_delete
	}
}
```

#### Conditionals

Sometimes you only want to add or remove a record from a list when an argument has a particular value.
For example, in a todo list you might only want to add the result to the list if there is no filter being
applied. To support this, houdini provides the `@when` and `@when_not` directives:

```graphql
mutation NewItem($input: AddItemInput!) {
	addItem(input: $input) {
		...All_Items_insert @when_not(completed: true)
	}
}
```
