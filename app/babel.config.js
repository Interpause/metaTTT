const presets = [
	[
		'@babel/preset-env',
		{
			useBuiltIns: 'usage',
			corejs: '3.16.2',
		},
	],
]

const babelrcRoots = '../*'

const plugins = [
	'@emotion/babel-plugin',
	'babel-plugin-macros',
	[
		'@emotion/babel-plugin-jsx-pragmatic',
		{
			export: 'jsx',
			import: '__cssprop',
			module: '@emotion/react',
		},
	],
	[
		'@babel/plugin-transform-react-jsx',
		{
			pragma: '__cssprop',
			pragmaFrag: 'React.Fragment',
		},
	],
]

if (process.env.NODE_ENV === 'production') {
	console.log('[metattt-app] Adding production babel plugins...')
	//plugins.push('transform-remove-console')
}

module.exports = { presets, plugins, babelrcRoots }
