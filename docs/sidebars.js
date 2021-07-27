/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
	docs: [
		'tour/index',
		{
			type: 'category',
			label: '👶 Getting Started',
			collapsed: false,
			items: [
				'tour/getting-started/setup',
				'tour/getting-started/workflow',
				'tour/getting-started/config',
			],
		},
		'tour/query',
		'tour/fragments',
		'tour/mutations',
		{
			type: 'category',
			label: '💪 Advanced Topics',
			collapsed: false,
			items: [
				'tour/advanced/subscriptions',
				'tour/advanced/pagination',
				'tour/advanced/scalars',
				'tour/advanced/authentication',
				'tour/advanced/node',
			],
		},
	],
	api: ['api/index'],
}
