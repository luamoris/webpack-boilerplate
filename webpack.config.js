// ======================================================================================

const path = require('path');

// Files
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Minify
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// ======================================================================================

const MODE = {
	CURRENT: process.env.NODE_ENV,
	isDEVELOPMENT: process.env.NODE_ENV === 'development',
	isPRODUCTION: process.env.NODE_ENV === 'production',
};

// ======================================================================================

// Resolve
const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

// Filename
const getFilePath = (dir, title, exp) => `${dir}/${exp}/${MODE.isPRODUCTION ? `${title}.[contenthash:8].${exp}` : MODE.isDEVELOPMENT && `${title}.${exp}`}`;
const getFileChunk = (dir, title, exp) => `${dir}/${exp}/${MODE.isPRODUCTION ? `${title}.[contenthash:8].chunk.${exp}` : MODE.isDEVELOPMENT && `${title}.chunk.${exp}`}`;

// ======================================================================================

const PATH = {
	ENTRY: {
		MAIN: resolvePath('src/app.js'),
	},
	INPUT: {
		HTML: resolvePath('src/index.html'),
		IMG: resolvePath('src/img/'),
	},
	OUTPUT: {
		DIR: resolvePath('dist'),
		HTML: 'index.html',
		JS: {
			NAME: getFilePath('static', 'bundle', 'js'),
			CHUCK: getFileChunk('static', 'bundle', 'js'),
		},
		CSS: {
			TYPE: 'text/css',
			NAME: getFilePath('static', 'style', 'css'),
			CHUCK: getFileChunk('static', 'style', 'css'),
			PUBLICK: '../../',
		},
		IMG: 'img/',
		MEDIA: 'assets/',
		FONTS: 'fonts/',
	},
};

const TEST = {
	SCSS: /\.s[ac]ss$/,
	IMG: /\.(png|jpe?g|svg|gif)$/,
	FONTS: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
	JS: /\.js$/,
};

// ======================================================================================

// PLUGINS
const getPlugins = () => {
	const htmlWebpack = {
		template: PATH.INPUT.HTML,
		filename: PATH.OUTPUT.HTML,
	};
	MODE.isPRODUCTION ? htmlWebpack.minify = {
		removeComments: true,
		collapseWhitespace: true,
		removeRedundantAttributes: true,
		useShortDoctype: true,
		removeEmptyAttributes: true,
		removeStyleLinkTypeAttributes: true,
		keepClosingSlash: true,
		minifyJS: true,
		minifyCSS: true,
		minifyURLs: true,
	} : undefined;

	const plugins = [

		new MiniCssExtractPlugin({
			linkType: PATH.OUTPUT.CSS.TYPE,
			filename: PATH.OUTPUT.CSS.NAME,
			chunkFilename: PATH.OUTPUT.CSS.CHUCK,
		}),

		new HtmlWebpackPlugin(htmlWebpack),

		new CopyPlugin({
			patterns: [
				{ from: PATH.INPUT.IMG, to: PATH.OUTPUT.IMG },
			],
		}),

	];

	if (MODE.isPRODUCTION) {
		plugins.push(
			new ImageminPlugin({
				disable: true,
				test: TEST.IMG,
				optipng: { optimizationLevel: 3 },
				jpegtran: { progressive: true },
				gifsicle: { optimizationLevel: 1 },
				svgo: {},
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
			}),
			new BabelMinifyPlugin(),
		);
	}

	return plugins;
};

// CSS LOADERS
const cssLoaders = (preProcessor) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				publicPath: PATH.OUTPUT.CSS.PUBLICK,
			},
		},
		{
			loader: 'css-loader',
			options: {},
		},
		{
			loader: 'postcss-loader',
			options: {},
		},
	];
	if (preProcessor) {
		loaders.push(preProcessor);
	}
	return loaders;
};

// MODULE RULES
const getModuleRules = () => {
	const rules = [
		{
			test: TEST.SCSS,
			use: cssLoaders('sass-loader'),
		},
		{
			test: TEST.IMG,
			use: [
				{
					loader: 'file-loader',
					options: {
						name: '[name].[hash:8].[ext]',
						outputPath: PATH.OUTPUT.MEDIA,
					},
				},
			],
		},
		{
			test: TEST.FONTS,
			use: [
				{
					loader: 'file-loader',
					options: {
						name: '[name].[hash:8].[ext]',
						outputPath: PATH.OUTPUT.FONTS,
					},
				},
			],
		},
		{
			test: TEST.JS,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
				},
			},
		},
	];
	return rules;
};

// SERVER
const getServer = () => {
	const server = {
		watchContentBase: true,
		compress: true,
		port: 4001,
		hot: true,
		noInfo: true,
	};
	return server;
};

// ======================================================================================

const CONFIG = {
	mode: MODE.CURRENT,
	devtool: MODE.isPRODUCTION ? 'source-map' : 'cheap-module-source-map',
	entry: {
		main: PATH.ENTRY.MAIN,
	},
	output: {
		path: PATH.OUTPUT.DIR,
		filename: PATH.OUTPUT.JS.NAME,
		chunkFilename: PATH.OUTPUT.JS.CHUCK,
	},
	plugins: getPlugins(),
	module: {
		rules: getModuleRules(),
	},
	devServer: getServer(),
};

if (MODE.isPRODUCTION) {
	CONFIG.output.publicPath = './';
	CONFIG.optimization = {
		splitChunks: {
			chunks: 'all',
		},
		minimizer: [
			new TerserWebpackPlugin(),
			new OptimizeCssAssetsPlugin({
				cssProcessorOptions: { discardComments: { removeAll: true } },
			}),
		],
	};
}

// ======================================================================================

module.exports = CONFIG;

// ======================================================================================

/*
	rimraf - to remove a directory
	cross-env - converts commands for the operating system
	webpack-dev-server - development server
*/
