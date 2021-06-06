import * as express from 'express';
import * as history from 'connect-history-api-fallback';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as WebpackHotMiddleware from 'webpack-hot-middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';
const app = express();
import { config } from './webpack.config';

const compiler = webpack(config);
const PORT = process.env.PORT || 8080;
import * as chalk from 'chalk';

app.use(history());

app.use(webpackDevMiddleware(compiler));

app.use(WebpackHotMiddleware(compiler, {
    log: false
}));

// app.use('/static/img', express.static('public/img'))

app.use('/api', createProxyMiddleware({ target: 'http://192.168.1.106:3000', changeOrigin: true }));

app.use(express.static('dist'));

app.listen(PORT, async () => {
    console.log(chalk.cyan(`Dev server listening on port ${PORT}`));
});

