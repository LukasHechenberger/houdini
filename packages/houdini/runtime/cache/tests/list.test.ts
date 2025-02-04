// external imports
import { testConfig } from 'houdini-common'
// locals
import { Cache, rootID } from '../cache'
import { SubscriptionSelection } from '../../types'

const config = testConfig()

test('prepend linked lists update', function () {
	// instantiate the cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				firstName: {
					type: 'String',
					keyRaw: 'firstName',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					update: 'prepend',
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	} as SubscriptionSelection

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
					{
						id: '3',
						firstName: 'mary',
					},
				],
			},
		},
		applyUpdates: true,
	})

	// make sure we can get the linked lists back
	expect(
		cache.internal
			.getRecord(cache.id('User', '1')!)
			?.flatLinkedList('friends')
			.map((data) => data!.fields)
	).toEqual([
		{
			id: '2',
			firstName: 'jane',
		},
		{
			id: '3',
			firstName: 'mary',
		},
	])

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [
					{
						id: '4',
						firstName: 'jane',
					},
					{
						id: '5',
						firstName: 'mary',
					},
				],
			},
		},
		applyUpdates: true,
	})

	// make sure we can get the linked lists back
	expect(
		cache.internal
			.getRecord(cache.id('User', '1')!)
			?.flatLinkedList('friends')
			.map((data) => data!.fields)
	).toEqual([
		{
			id: '4',
			firstName: 'jane',
		},
		{
			id: '5',
			firstName: 'mary',
		},
		{
			id: '2',
			firstName: 'jane',
		},
		{
			id: '3',
			firstName: 'mary',
		},
	])
})

test('append in list', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache.list('All_Users').append(
		{ id: { type: 'ID', keyRaw: 'id' }, firstName: { type: 'String', keyRaw: 'firstName' } },
		{
			id: '3',
			firstName: 'mary',
		}
	)

	// make sure we got the new value
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: [
				{
					firstName: 'jane',
					id: '2',
				},
				{
					firstName: 'mary',
					id: '3',
				},
			],
		},
	})
})

test('prepend in list', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache.list('All_Users').prepend(
		{ id: { type: 'ID', keyRaw: 'id' }, firstName: { type: 'String', keyRaw: 'firstName' } },
		{
			id: '3',
			firstName: 'mary',
		}
	)

	// make sure we got the new value
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: [
				{
					firstName: 'mary',
					id: '3',
				},
				{
					firstName: 'jane',
					id: '2',
				},
			],
		},
	})
})

test('remove from connection', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: true,
						type: 'User',
					},
					fields: {
						edges: {
							type: 'UserEdge',
							keyRaw: 'edges',
							fields: {
								node: {
									type: 'Node',
									keyRaw: 'node',
									abstract: true,
									fields: {
										__typename: {
											type: 'String',
											keyRaw: '__typename',
										},
										id: {
											type: 'ID',
											keyRaw: 'id',
										},
										firstName: {
											type: 'String',
											keyRaw: 'firstName',
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: {
					edges: [
						{
							node: {
								__typename: 'User',
								id: '2',
								firstName: 'jane',
							},
						},
						{
							node: {
								__typename: 'User',
								id: '3',
								firstName: 'jane',
							},
						},
					],
				},
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection: selection,
	})

	// remove user 2 from the list
	cache.list('All_Users').remove({
		id: '2',
	})

	// the first time set was called, a new entry was added.
	// the second time it's called, we get a new value for mary-prime
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: {
				edges: [
					{
						node: {
							__typename: 'User',
							id: '3',
							firstName: 'jane',
						},
					},
				],
			},
		},
	})

	// make sure we aren't subscribing to user 2 any more
	expect(
		cache.internal.getRecord(cache.id('User', '2')!)?.getSubscribers('firstName')
	).toHaveLength(0)
	// but we're still subscribing to user 3
	expect(
		cache.internal.getRecord(cache.id('User', '3')!)?.getSubscribers('firstName')
	).toHaveLength(1)
	// make sure we deleted the edge holding onto this information
	expect(cache.internal.getRecord('User:1.friends.edges[0]#User:2')).toBeUndefined()
})

test('append in connection', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: true,
						type: 'User',
					},
					fields: {
						edges: {
							type: 'UserEdge',
							keyRaw: 'edges',
							fields: {
								node: {
									type: 'Node',
									keyRaw: 'node',
									abstract: true,
									fields: {
										__typename: {
											type: 'String',
											keyRaw: '__typename',
										},
										id: {
											type: 'ID',
											keyRaw: 'id',
										},
										firstName: {
											type: 'String',
											keyRaw: 'firstName',
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: {
					edges: [
						{
							node: {
								__typename: 'User',
								id: '2',
								firstName: 'jane',
							},
						},
					],
				},
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache.list('All_Users').append(
		{ id: { type: 'ID', keyRaw: 'id' }, firstName: { type: 'String', keyRaw: 'firstName' } },
		{
			id: '3',
			firstName: 'mary',
		}
	)

	// make sure we got the new value
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: {
				edges: [
					{
						node: {
							__typename: 'User',
							id: '2',
							firstName: 'jane',
						},
					},
					{
						node: {
							__typename: 'User',
							id: '3',
							firstName: 'mary',
						},
					},
				],
			},
		},
	})
})

test('inserting data with an update overwrites a record inserted with list.append', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: true,
						type: 'User',
					},
					fields: {
						edges: {
							type: 'UserEdge',
							keyRaw: 'edges',
							fields: {
								node: {
									type: 'Node',
									keyRaw: 'node',
									abstract: true,
									fields: {
										__typename: {
											type: 'String',
											keyRaw: '__typename',
										},
										id: {
											type: 'ID',
											keyRaw: 'id',
										},
										firstName: {
											type: 'String',
											keyRaw: 'firstName',
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: {
					edges: [
						{
							node: {
								__typename: 'User',
								id: '2',
								firstName: 'jane',
							},
						},
					],
				},
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache.list('All_Users').append(
		{ id: { type: 'ID', keyRaw: 'id' }, firstName: { type: 'String', keyRaw: 'firstName' } },
		{
			id: '3',
			firstName: 'mary',
		}
	)

	// insert a record with a query update
	cache.write({
		applyUpdates: true,
		data: {
			viewer: {
				id: '1',
				firstName: 'John',
				friends: {
					edges: [
						{
							cursor: '1234',
							node: {
								__typename: 'User',
								id: '3',
								firstName: 'mary',
							},
						},
					],
				},
			},
		},
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
					firstName: {
						type: 'String',
						keyRaw: 'firstName',
					},
					friends: {
						type: 'User',
						keyRaw: 'friends',
						fields: {
							edges: {
								type: 'UserEdge',
								keyRaw: 'edges',
								update: 'append',
								fields: {
									cursor: {
										type: 'String',
										keyRaw: 'cursor',
									},
									node: {
										type: 'User',
										keyRaw: 'node',
										fields: {
											__typename: {
												type: 'String',
												keyRaw: '__typename',
											},
											id: {
												type: 'ID',
												keyRaw: 'id',
											},
											firstName: {
												type: 'String',
												keyRaw: 'firstName',
											},
										},
									},
								},
							},
						},
					},
				},
			},
		} as SubscriptionSelection,
	})

	// make sure the duplicate has been removed
	expect(set).toHaveBeenNthCalledWith(2, {
		viewer: {
			id: '1',
			friends: {
				edges: [
					{
						node: {
							__typename: 'User',
							id: '2',
							firstName: 'jane',
						},
					},
					{
						node: {
							__typename: 'User',
							id: '3',
							firstName: 'mary',
						},
					},
				],
			},
		},
	})
})

test('list filter - must_not positive', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					filters: {
						foo: {
							kind: 'String',
							value: 'bar',
						},
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache
		.list('All_Users')
		.when({ must_not: { foo: 'not-bar' } })
		.prepend(
			{
				id: { type: 'ID', keyRaw: 'id' },
				firstName: { type: 'String', keyRaw: 'firstName' },
			},
			{
				id: '3',
				firstName: 'mary',
			}
		)

	// make sure we got the new value
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: [
				{
					firstName: 'mary',
					id: '3',
				},
				{
					firstName: 'jane',
					id: '2',
				},
			],
		},
	})
})

test('list filter - must_not negative', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					filters: {
						foo: {
							kind: 'String',
							value: 'bar',
						},
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache
		.list('All_Users')
		.when({ must_not: { foo: 'bar' } })
		.prepend(
			{
				id: { type: 'ID', keyRaw: 'id' },
				firstName: { type: 'String', keyRaw: 'firstName' },
			},
			{
				id: '3',
				firstName: 'mary',
			}
		)

	// make sure we got the new value
	expect(set).not.toHaveBeenCalled()
})

test('list filter - must positive', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					filters: {
						foo: {
							kind: 'String',
							value: 'bar',
						},
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache
		.list('All_Users')
		.when({ must: { foo: 'bar' } })
		.prepend(
			{
				id: { type: 'ID', keyRaw: 'id' },
				firstName: { type: 'String', keyRaw: 'firstName' },
			},
			{
				id: '3',
				firstName: 'mary',
			}
		)

	// make sure we got the new value
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: [
				{
					firstName: 'mary',
					id: '3',
				},
				{
					firstName: 'jane',
					id: '2',
				},
			],
		},
	})
})

test('list filter - must negative', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					filters: {
						foo: {
							kind: 'String',
							value: 'bar',
						},
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// insert an element into the list (no parent ID)
	cache
		.list('All_Users')
		.when({ must: { foo: 'not-bar' } })
		.prepend(
			{
				id: { type: 'ID', keyRaw: 'id' },
				firstName: { type: 'String', keyRaw: 'firstName' },
			},
			{
				id: '3',
				firstName: 'mary',
			}
		)

	// make sure we got the new value
	expect(set).not.toHaveBeenCalled()
})

test('remove from list', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection: selection,
	})

	// remove user 2 from the list
	cache.list('All_Users').remove({
		id: '2',
	})

	// the first time set was called, a new entry was added.
	// the second time it's called, we get a new value for mary-prime
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: [],
		},
	})

	// make sure we aren't subscribing to user 2 any more
	expect(
		cache.internal.getRecord(cache.id('User', '2')!)?.getSubscribers('firstName')
	).toHaveLength(0)
})

test('delete node', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
				],
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// remove user 2 from the list
	cache.delete(
		'User',
		cache.id('User', {
			id: '2',
		})!
	)

	// we should have been updated with an empty list
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: [],
		},
	})

	// make sure its empty now
	expect(cache.internal.getRecord('User:2')).toBeFalsy()
})

test('delete node from connection', function () {
	// instantiate a cache
	const cache = new Cache(config)

	const selection: SubscriptionSelection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: true,
						type: 'User',
					},
					fields: {
						edges: {
							type: 'UserEdge',
							keyRaw: 'edges',
							fields: {
								node: {
									type: 'Node',
									keyRaw: 'node',
									abstract: true,
									fields: {
										__typename: {
											type: 'String',
											keyRaw: '__typename',
										},
										id: {
											type: 'ID',
											keyRaw: 'id',
										},
										firstName: {
											type: 'String',
											keyRaw: 'firstName',
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// start off associated with one object
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				friends: {
					edges: [
						{
							node: {
								__typename: 'User',
								id: '2',
								firstName: 'jane',
							},
						},
					],
				},
			},
		},
	})

	// a function to spy on that will play the role of set
	const set = jest.fn()

	// subscribe to the fields
	cache.subscribe({
		rootType: 'Query',
		set,
		selection,
	})

	// remove user 2 from the list
	cache.delete(
		'User',
		cache.id('User', {
			id: '2',
		})!
	)

	// we should have been updated with an empty list
	expect(set).toHaveBeenCalledWith({
		viewer: {
			id: '1',
			friends: {
				edges: [],
			},
		},
	})

	// make sure its empty now
	expect(cache.internal.getRecord('User:2')).toBeFalsy()
})

test('append operation', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'insert',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: {
				id: '3',
			},
		},
	})

	// make sure we just added to the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(1)
})

test('append from list', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'insert',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: [{ id: '3' }, { id: '4' }],
		},
	})

	// make sure we just added to the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(2)
})

test('append when operation', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					filters: {
						value: {
							kind: 'String',
							value: 'foo',
						},
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'insert',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
						when: {
							must: {
								value: 'not-foo',
							},
						},
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: {
				id: '3',
			},
		},
	})

	// make sure we just added to the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(0)
})

test('prepend when operation', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					filters: {
						value: {
							kind: 'String',
							value: 'foo',
						},
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'insert',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
						position: 'first',
						when: {
							must: {
								value: 'not-foo',
							},
						},
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: {
				id: '3',
			},
		},
	})

	// make sure we just added to the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(0)
})

test('prepend operation', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
					friends: {
						type: 'User',
						keyRaw: 'friends',
						fields: {
							id: {
								type: 'String',
								keyRaw: 'id',
							},
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
						},
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
				friends: [
					{
						id: '2',
						firstName: 'mary',
					},
				],
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'insert',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
						position: 'first',
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: {
				id: '3',
			},
		},
	})

	// make sure we just added to the list
	expect(
		[...cache.list('All_Users', cache.id('User', '1')!)].map((record) => record!.fields.id)
	).toEqual(['3', '2'])
})

test('remove operation', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
					friends: {
						type: 'User',
						keyRaw: 'friends',
						fields: {
							id: {
								type: 'ID',
								keyRaw: 'id',
							},
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
						},
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
				friends: [{ id: '2', firstName: 'jane' }],
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be removed from the operation
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'remove',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: {
				id: '2',
			},
		},
	})

	// make sure we removed the element from the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(0)
})

test('remove operation from list', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
					friends: {
						type: 'User',
						keyRaw: 'friends',
						fields: {
							id: {
								type: 'ID',
								keyRaw: 'id',
							},
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
						},
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
				friends: [
					{ id: '2', firstName: 'jane' },
					{ id: '3', firstName: 'Alfred' },
				],
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be removed from the operation
	cache.write({
		selection: {
			newUser: {
				type: 'User',
				keyRaw: 'newUser',
				operations: [
					{
						action: 'remove',
						list: 'All_Users',
						parentID: {
							kind: 'String',
							value: cache.id('User', '1')!,
						},
					},
				],
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
				},
			},
		},
		data: {
			newUser: [{ id: '2' }, { id: '3' }],
		},
	})

	// make sure we removed the element from the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(0)
})

test('delete operation', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
					friends: {
						type: 'User',
						keyRaw: 'friends',
						fields: {
							id: {
								type: 'ID',
								keyRaw: 'id',
							},
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
						},
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
				friends: [{ id: '2', firstName: 'jane' }],
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			deleteUser: {
				type: 'User',
				keyRaw: 'deleteUser',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
						operations: [
							{
								action: 'delete',
								type: 'User',
							},
						],
					},
				},
			},
		},
		data: {
			deleteUser: {
				id: '2',
			},
		},
	})

	// make sure we removed the element from the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(0)

	expect(cache.internal.getRecord('User:2')).toBeFalsy()
})

test('delete operation from list', function () {
	// instantiate a cache
	const cache = new Cache(config)

	// create a list we will add to
	cache.write({
		selection: {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
					},
					friends: {
						type: 'User',
						keyRaw: 'friends',
						fields: {
							id: {
								type: 'ID',
								keyRaw: 'id',
							},
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
						},
					},
				},
			},
		},
		data: {
			viewer: {
				id: '1',
				friends: [
					{ id: '2', firstName: 'jane' },
					{ id: '3', firstName: 'Alfred' },
				],
			},
		},
	})

	// subscribe to the data to register the list
	cache.subscribe(
		{
			rootType: 'User',
			selection: {
				friends: {
					type: 'User',
					keyRaw: 'friends',
					list: {
						name: 'All_Users',
						connection: false,
						type: 'User',
					},
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
			parentID: cache.id('User', '1')!,
			set: jest.fn(),
		},
		{}
	)

	// write some data to a different location with a new user
	// that should be added to the list
	cache.write({
		selection: {
			deleteUser: {
				type: 'User',
				keyRaw: 'deleteUser',
				fields: {
					id: {
						type: 'ID',
						keyRaw: 'id',
						operations: [
							{
								action: 'delete',
								type: 'User',
							},
						],
					},
				},
			},
		},
		data: {
			deleteUser: {
				id: ['2', '3'],
			},
		},
	})

	// make sure we removed the element from the list
	expect([...cache.list('All_Users', cache.id('User', '1')!)]).toHaveLength(0)

	expect(cache.internal.getRecord('User:2')).toBeFalsy()
	expect(cache.internal.getRecord('User:3')).toBeFalsy()
})

test('disabled linked lists update', function () {
	// instantiate the cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				firstName: {
					type: 'String',
					keyRaw: 'firstName',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					update: 'append',
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	} as SubscriptionSelection

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
					{
						id: '3',
						firstName: 'mary',
					},
				],
			},
		},
	})

	// make sure we can get the linked lists back
	expect(
		cache.internal
			.getRecord(cache.id('User', '1')!)
			?.flatLinkedList('friends')
			.map((data) => data!.fields)
	).toEqual([
		{
			id: '2',
			firstName: 'jane',
		},
		{
			id: '3',
			firstName: 'mary',
		},
	])

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [
					{
						id: '3',
						firstName: 'jane',
					},
					{
						id: '4',
						firstName: 'mary',
					},
				],
			},
		},
	})

	// make sure we can get the linked lists back
	expect(
		cache.internal
			.getRecord(cache.id('User', '1')!)
			?.flatLinkedList('friends')
			.map((data) => data!.fields)
	).toEqual([
		{
			id: '3',
			firstName: 'jane',
		},
		{
			id: '4',
			firstName: 'mary',
		},
	])
})

test('append linked lists update', function () {
	// instantiate the cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				firstName: {
					type: 'String',
					keyRaw: 'firstName',
				},
				friends: {
					type: 'User',
					keyRaw: 'friends',
					update: 'append',
					fields: {
						id: {
							type: 'ID',
							keyRaw: 'id',
						},
						firstName: {
							type: 'String',
							keyRaw: 'firstName',
						},
					},
				},
			},
		},
	} as SubscriptionSelection

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [
					{
						id: '2',
						firstName: 'jane',
					},
					{
						id: '3',
						firstName: 'mary',
					},
				],
			},
		},
	})

	// make sure we can get the linked lists back
	expect(
		cache.internal
			.getRecord(cache.id('User', '1')!)
			?.flatLinkedList('friends')
			.map((data) => data!.fields)
	).toEqual([
		{
			id: '2',
			firstName: 'jane',
		},
		{
			id: '3',
			firstName: 'mary',
		},
	])

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [
					{
						id: '4',
						firstName: 'jane',
					},
					{
						id: '5',
						firstName: 'mary',
					},
				],
			},
		},
		applyUpdates: true,
	})

	// make sure we can get the linked lists back
	expect(
		cache.internal
			.getRecord(cache.id('User', '1')!)
			?.flatLinkedList('friends')
			.map((data) => data!.fields)
	).toEqual([
		{
			id: '2',
			firstName: 'jane',
		},
		{
			id: '3',
			firstName: 'mary',
		},
		{
			id: '4',
			firstName: 'jane',
		},
		{
			id: '5',
			firstName: 'mary',
		},
	])
})

test('writing a scalar marked with a disabled update overwrites', function () {
	// instantiate the cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				firstName: {
					type: 'String',
					keyRaw: 'firstName',
				},
				friends: {
					type: 'Int',
					keyRaw: 'friends',
					update: 'append',
				},
			},
		},
	} as SubscriptionSelection

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [1],
			},
		},
	})

	// make sure we can get the linked lists back
	expect(cache.internal.getData(cache.internal.record(rootID), selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'bob',
			friends: [1],
		},
	})

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [2],
			},
		},
	})

	// make sure we can get the updated lists back
	expect(cache.internal.getData(cache.internal.record(rootID), selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'bob',
			friends: [2],
		},
	})
})

test('writing a scalar marked with a prepend', function () {
	// instantiate the cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				firstName: {
					type: 'String',
					keyRaw: 'firstName',
				},
				friends: {
					type: 'Int',
					keyRaw: 'friends',
					update: 'prepend',
				},
			},
		},
	} as SubscriptionSelection

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [1],
			},
		},
	})

	// make sure we can get the linked lists back
	expect(cache.internal.getData(cache.internal.record(rootID), selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'bob',
			friends: [1],
		},
	})

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [2],
			},
		},
		applyUpdates: true,
	})

	// make sure we can get the updated lists back
	expect(cache.internal.getData(cache.internal.record(rootID), selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'bob',
			friends: [2, 1],
		},
	})
})

test('writing a scalar marked with an append', function () {
	// instantiate the cache
	const cache = new Cache(config)

	const selection = {
		viewer: {
			type: 'User',
			keyRaw: 'viewer',
			fields: {
				id: {
					type: 'ID',
					keyRaw: 'id',
				},
				firstName: {
					type: 'String',
					keyRaw: 'firstName',
				},
				friends: {
					type: 'Int',
					keyRaw: 'friends',
					update: 'append',
				},
			},
		},
	} as SubscriptionSelection

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [1],
			},
		},
	})

	// make sure we can get the linked lists back
	expect(cache.internal.getData(cache.internal.record(rootID), selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'bob',
			friends: [1],
		},
	})

	// add some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'bob',
				friends: [2],
			},
		},
		applyUpdates: true,
	})

	// make sure we can get the updated lists back
	expect(cache.internal.getData(cache.internal.record(rootID), selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'bob',
			friends: [1, 2],
		},
	})
})
