// external imports
import { testConfig } from 'houdini-common'
// locals
import { Cache, rootID } from '../cache'

const config = testConfig()

test('adding a layer to a cache is reflected when retrieving data', function () {
	// instantiate a cache we'll test against
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
			},
		},
	}

	const parent = cache.internal.record(rootID)

	// write some data to the cache
	cache.write({
		selection,
		data: {
			viewer: {
				id: '1',
				firstName: 'John',
			},
		},
	})

	// add a layer with the
	const layerID = cache.addLayer({
		parentID: 'User:1',
		selection: {
			firstName: {
				keyRaw: 'firstName',
				type: 'String',
			},
		},
		data: {
			firstName: 'Alex',
		},
	})

	// look up the data
	expect(cache.internal.getData(parent, selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'Alex',
		},
	})

	// delete the layer
	cache.deleteLayer(layerID)

	// lookup the data again
	expect(cache.internal.getData(parent, selection, {})).toEqual({
		viewer: {
			id: '1',
			firstName: 'John',
		},
	})
})

test.todo('layer with linked record')
