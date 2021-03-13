const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development';
const isProdMode = !isDevMode;

const filename = (ext) => isDevMode ? `${ext}/[name].${ext}` : `${ext}/[name].[hash].${ext}`;

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all',
		},
	};
	if (isProdMode) {
		config.minimizer = [
			new TerserWebpackPlugin(),
			new OptimizeCssAssetsPlugin({
				cssProcessorOptions: { discardComments: { removeAll: true } },
			}),
		];
	}
	return config;
};

const plugins = () => {
	const base = [
		new HTMLWebpackPlugin({
			template: './index.html',
			filename: './index.html',
			minify: {
				collapseWhitespace: isProdMode,
				minifyCSS: isProdMode,
				removeComments: isProdMode,
			},
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: './img/', to: 'img/' },
			],
		}),
		new MiniCssExtractPlugin({
			filename: filename('css'),
			chunkFilename: isDevMode ? 'css/[id].[hash].css' : 'css/[id].css',
		}),
		new ImageminPlugin({
			disable: isDevMode,
			test: /\.(jpe?g|png|gif|svg)$/i,
			optipng: { optimizationLevel: 3 },
			jpegtran: { progressive: true },
			gifsicle: { optimizationLevel: 1 },
			svgo: {},
		}),
	];
	if (isProdMode) {
		base.push(
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
			}),
			new BabelMinifyPlugin(),
		);
	}
	return base;
};

const cssLoaders = (ext) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				publicPath: '../',
			},
		},
		'css-loader',
	];
	if (ext) { loaders.push(ext); }
	return loaders;
};

const babelOptions = (preset) => {
	const opts = {
		presets: ['@babel/preset-env'],
		plugins: [],
	};
	if (preset) { opts.presets.push(preset); }
	return opts;
};

const output = () => {
	const out = {
		filename: filename('js'),
		path: path.resolve(__dirname, 'build'),
	};
	if (isProdMode) { out.publicPath = './'; }
	return out;
};

module.exports = {
	mode: process.env.NODE_ENV,
	devtool: 'cheap-module-source-map',
	context: path.resolve(__dirname, 'src'),
	entry: {
		main: ['@babel/polyfill', './js/app.js'],
	},
	output: output(),
	optimization: optimization(),
	plugins: plugins(),
	module: {
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders(),
			},
			{
				test: /\.less$/,
				use: cssLoaders('less-loader'),
			},
			{
				test: /\.s[ac]ss$/,
				use: cssLoaders('sass-loader'),
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[hash].[ext]',
							outputPath: 'img',
						},
					},
				],
			},
			{
				test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'fonts',
						},
					},
				],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: babelOptions(),
				},
			},
		],
	},
	devServer: {
		contentBase: path.join(__dirname, 'src'),
		compress: true,
		port: 3001,
		hot: true,
		watchContentBase: true,
		noInfo: true,
	},
};
