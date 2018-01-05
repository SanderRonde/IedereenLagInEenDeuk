/// <reference path="../../typings/server.d.ts" />

import express = require('express');
import https = require('https');
import path = require('path');
import fs = require('fs');
const favicon: (path: string) => express.RequestHandler = require('serve-favicon');
const compression: (options?: any) => express.RequestHandler = require('compression');

const certs = {
	key: fs.readFileSync('./certs/key.pem'),
	cert: fs.readFileSync('./certs/cert.pem'),
	passphrase: 'password', 
	requestCert: false,
	rejectUnauthorized: false
};

const ARGS: {
	[key: string]: string;
} = {};
process.argv.forEach((val, index) => {
	ARGS[val.split('=')[0]] = val.split('=')[1];
});

const PORT_DATA = {
	HTTP: ARGS['--http'] || 80,
	HTTPS: ARGS['--https'] || 443
};

function wrapPromise<T>(promise: Promise<T>): {
	catch(handler: (err: any) => void|PromiseLike<void>): Promise<T>;
} {
	return {
		catch(handler): Promise<T> {
			return new Promise<T>((resolve) => {
				promise.catch((err) => {
					return handler(err);
				});
				promise.then((result) => {
					resolve(result);
				});
			});
		}
	}
}

function promisify<T>(fn: Function, context: any, ...args: Array<any>): Promise<T> {
	return new Promise((resolve, reject) => {
		fn.apply(context, args.concat((err: Error|null, result: T) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		}))
	});
}

const HTTP_PUSH_MAP: {
	[key: string]: Array<{
		path: string;
		as: 'media'|'script'|'style'|'font'|'image'|'worker'|'embed'|
			'object'|'document';
	}>;
} = {
	'index': [{
		path: '/resources/vid.mp4',
		as: 'media'
	}, {
		path: '/js/main.js',
		as: 'script'
	}, {
		path: 'https://fonts.googleapis.com/css?family=Roboto:400',
		as: 'style'
	}]
};

(async () => {
	const app = express();

	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views/'));
	app.set('view engine', 'jade');

	app.use((req, res, next) => {
		const originalEnd = res.end;
		res.end = (...args: Array<any>) => {
			console.log('[request]', `Request for url ${req.url} from ip ${
				req.connection.remoteAddress
			} ended with status code ${res.statusCode}`);
			originalEnd.apply(res, args);
		}
	});
	app.use(favicon(path.join(__dirname, '../client/public/favicon.ico')));
	app.use(compression());
	//app.use('/', le.middleware());
	app.use(express.static(
		path.join(
			__dirname, '../client/public'
		), {
			maxAge: 1000 * 60 * 60 * 24 * 365
		}
	));

	function renderPath(path: string, params: {
		[key: string]: any;
	} = {}): express.RequestHandler {
		return async (req, res) => {
			const html = await wrapPromise(promisify(app.render, app, path, params)).catch((err) => {
				res.writeHead(500);
			});
			if (html) {
				res.setHeader('Content-type', 'text/html');
				if (HTTP_PUSH_MAP[path]) {
					HTTP_PUSH_MAP[path].forEach((resource) => {
						res.setHeader('Link', `<${resource.path}>; rel=preload; as=${resource.as}`);
					});
				}
				res.end(html);
			}
		}
	}

	app.get('/', renderPath('index'));
	app.get('/cached', renderPath('index', {
		offline: true
	}));
	app.get('/404', renderPath('404'));

	app.use(async (req, res, next) => {
		res.status(404);

		if (req.accepts('html')) {
			const html = await wrapPromise(promisify(app.render, app, '404', {})).catch((err) => {
				res.writeHead(500);
			});
			if (html) {
				res.setHeader('Content-type', 'text/html');
				res.end(html);
			}
			return;
		}

		if (req.accepts('json')) {
			res.end({
				error: 'Not Found'
			});
			return;
		}

		res.type('txt').send('Not Found');
	});

	https.createServer(certs, app).listen(PORT_DATA.HTTPS, () => {
		console.log(`HTTPS server listening on port ${PORT_DATA.HTTPS}`);
	});
	app.listen(PORT_DATA.HTTP, () => {
		console.log(`HTTP server listening on port ${PORT_DATA.HTTP}`);
	});
})();