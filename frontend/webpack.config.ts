import { join, resolve as _resolve } from 'path';

import * as webpack from 'webpack';
import { HotModuleReplacementPlugin } from 'webpack';

import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { loader as _loader } from 'mini-css-extract-plugin';

import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as WebpackPwaManifest from 'webpack-pwa-manifest';

const HTMLWebpackPlugin = new HtmlWebpackPlugin({
	template: join(__dirname, '/src/index.html'),
	filename: 'index.html',
	inject: 'body'
});

const ManifestPlugin = new WebpackPwaManifest({
	'short_name': 'File Server',
	'name': 'File Server',
	'start_url': '.',
	'display': 'standalone'
	// 'background_color': '#ffffff'
});

// const EnvironmentPlugin = new webpack.EnvironmentPlugin({
// 	NODE_ENV: 'development'
// })

const dev = process.env.NODE_ENV !== 'production';

export const config: webpack.Configuration = {
	entry: ['webpack-hot-middleware/client?reload=true', './src/index.tsx'],
	output: {
		filename: 'bundle.js',
		path: _resolve(__dirname, 'dist'),
		publicPath: '/'
	},
	mode: dev ? 'development' : 'production',
	module: {
		rules: [
			{
				// Check JSX before Compilation
				enforce: 'pre',
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'eslint-loader'
			},
			{
				// JSX
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				// TSX
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				// CSS
				test: /\.s?css$/,
				use: [dev ? 'style-loader' : _loader, 'css-loader', 'sass-loader']
			},
			{
				// Images
				test: /\.(jpe?g|png|gif|svg)$/i,
				loader: 'url-loader',
				options: {
					limit: 10000
				}
			}
		]
	},

	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js']
	},

	plugins: dev ?
		[
			HTMLWebpackPlugin,
			new HotModuleReplacementPlugin(),
			// EnvironmentPlugin
			ManifestPlugin
		] :
		[
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[id].css'
			}),
			HTMLWebpackPlugin,
			// EnvironmentPlugin
			// ManifestPlugin
		]
};
