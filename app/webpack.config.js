const webpack = require('webpack')
const path = require('path')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { WebpackPluginServe } = require('webpack-plugin-serve')

const isDev = process.env.NODE_ENV == 'development'
const outPath = path.resolve(__dirname, 'dist')

console.log('is Development: ', isDev)

const config = {
	mode: isDev ? 'development' : 'production',
	entry: [isDev && 'webpack-plugin-serve/client', './index.ts'].filter(Boolean),
	output: {
		path: outPath,
		filename: '[name].bundle.js',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							getCustomTransformers: () => ({
								before: isDev ? [ReactRefreshTypeScript()] : [],
							}),
							transpileOnly: isDev,
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Output Management',
		}),
		isDev && new ReactRefreshWebpackPlugin(),
		isDev &&
			new WebpackPluginServe({
				host: 'localhost',
				port: 8080,
				progress: 'minimal',
				static: outPath,
			}),
	].filter(Boolean),
	watch: isDev,
	devtool: isDev ? 'eval-source-map' : false,
}

module.exports = config
