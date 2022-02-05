import * as path from 'path';

import * as webpack from 'webpack';
import { HotModuleReplacementPlugin } from 'webpack';

import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

import * as HtmlWebpackPlugin from 'html-webpack-plugin';

const HTMLWebpackPlugin = new HtmlWebpackPlugin({
	template: path.join(__dirname, '/src/index.html'),
	filename: 'index.html',
	inject: 'body'
});

const dev = process.env.NODE_ENV !== 'production';

export const config: webpack.Configuration = {
	entry: ['webpack-hot-middleware/client?reload=true', './src/index.tsx'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/'
	},
	mode: dev ? 'development' : 'production',
	module: {
		rules: [
			// {
			// 	// Check JSX before Compilation
			// 	enforce: 'pre',
			// 	test: /\.tsx?$/,
			// 	exclude: /node_modules/,
			// 	loader: 'eslint-loader'
			// },
			{
				// TSX
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				// CSS
				test: /\.s?css$/,
				use: [
					dev ? 'style-loader' : MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					// 'sass-loader'
				]
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
		] :
		[
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[id].css'
			}),
			HTMLWebpackPlugin,
		]
};
