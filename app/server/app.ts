/// <reference path="../../typings/server.d.ts" />

import express = require('express');
import https = require('https');
import path = require('path');
//import http = require('http');
import fs = require('fs');


//const http2 = require('http2');

const favicon = require('serve-favicon');
const compression = require('compression');

// const LEX = require('letsencrypt-express').create({
// 	server: 'https://acme-v01.api.letsencrypt.org/directory',
// 	email: 'awsdfgvhbjn@gmail.com',
// 	agreeTos: true,
// 	approveDomains: ['deuropen.com', 'www.deuropen.com', 'localhost'],
// 	challenges: {
// 		'http-01': require('le-challenge-fs').create({
// 			webrootPath: './tmp/acme-challenges'
// 		})
// 	},
// 	store: require('le-store-certbot').create({
// 		webrootPath: './tmp/acme-challenges'
// 	})
// });

// http.createServer(LEX.middleware(require('redirect-https')())).listen(80, function(this: http.Server) {
// 	console.log('Listening for ACME challenges on', this.address());
// })

const certs = {
	key: fs.readFileSync('./certs/key.pem'),
	cert: fs.readFileSync('./certs/cert.pem'),
	passphrase: 'password', 
	requestCert: false,
	rejectUnauthorized: false
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

function logRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
	const originalEnd = res.end;
	res.end = (chunk?: any, encoding?: any) => {
		console.log('[request]', 
			`Request for url ${req.url} from ip ${
				req.connection.remoteAddress
			} ended with status code ${res.statusCode}`);
		originalEnd.call(res, chunk, encoding);
	}
	next();
}

(async () => {
	const app = express();

	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views/'));
	app.set('view engine', 'jade');

	app.use(favicon(path.join(__dirname, '../client/public/favicon.ico')));
	app.use(compression());
	//app.use('/', le.middleware());
	app.use(express.static(
		path.join(
			__dirname, '../client/public'
		), {
			maxAge: 5 //TODO change
		}
	));

	app.use(logRequest);

	app.get('/', async (req, res) => {
		const html = await wrapPromise(promisify(app.render, app, '/', {})).catch((err) => {
			console.log(`Error while rendering ${'/'}, ${err.message}, ${err.stack}`);
			res.writeHead(500);
		});
		if (html) {
			res.setHeader('Content-type', 'text/html');
			res.end(html);
		}
	});
	app.get('/404', async (req, res) => {
		const html = await wrapPromise(promisify(app.render, app, '/404', {})).catch((err) => {
			console.log(`Error while rendering ${'/'}, ${err.message}, ${err.stack}`);
			res.writeHead(500);
		});
		if (html) {
			res.setHeader('Content-type', 'text/html');
			res.end(html);
		}
	});

	app.use(async (req, res, next) => {
		res.status(404);

		if (req.accepts('html')) {
			const html = await wrapPromise(promisify(app.render, app, '/404', {})).catch((err) => {
				console.log(`Error while rendering ${'/404'}, ${err.message}, ${err.stack}`);
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

	https.createServer(certs, app).listen(443, () => {
		console.log(`HTTPS server listening on port 443`);
	});
	app.listen(80, () => {
		console.log('Listening on port 80');
	});
});