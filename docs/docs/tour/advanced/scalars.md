---
title: ⚖️ Custom Scalars
---

Configuring your runtime to handle custom scalars is done under the `scalars` key in your config:

```javascript
// houdini.config.js

export default {
	// ...

	scalars: {
		// the name of the scalar we are configuring
		DateTime: {
			// the corresponding typescript type
			type: 'Date',
			// turn the api's response into that type
			unmarshal(val) {
				return new Date(val)
			},
			// turn the value into something the API can use
			marshal(date) {
				return date.getTime()
			},
		},
	},
}
```
