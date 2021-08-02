// locals
import { Environment, FetchParams } from './network'

test('network requests out of order', async function () {
	// wait order will be 2,1,3 but it should still resolve as if it was 1, 2, 3
	const fetch = async ({ text }: FetchParams) => {
		// if the text is 1 wait 10 second
		if (text === '1') {
			await sleep(30)
		} else if (text === '2') {
			await sleep(10)
		} else if (text === '3') {
			await sleep(30)
		}

		return { data: {}, errors: [] }
	}

	// define an environment with our fetch
	const env = new Environment(fetch)

	// add the fetch number to a list when it resolves
	// this ensures they get resolved in the correct order, regardless of how long the server takes
	const sendRequest = (text: string) =>
		env.sendRequest(
			{
				page: { host: '', path: '', params: {}, query: new URLSearchParams('') },
				// @ts-ignore
				fetch: () => {},
				session: {},
			},
			{ text }
		)

	// track the order things resolved
	const resolvedOrder = []

	// send the requests and then add the number to the list
	await Promise.all([
		sendRequest('1').then(() => resolvedOrder.push('1')),
		sendRequest('2').then(() => resolvedOrder.push('2')),
		sendRequest('3').then(() => resolvedOrder.push('3')),
	])

	// make sure they resolved in the right order
	expect(resolvedOrder).toEqual(['1', '2', '3'])
})

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
