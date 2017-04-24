/// <reference path="../../../../../typings/serviceworker.d.ts"/>
declare function importScripts(name: string): void;

importScripts('/js/libs/sw-toolbox.js');

toolbox.options.debug = true;
toolbox.options.cache.name = 'IedereenLagInEenDeukCache';
toolbox.options.cache.maxEntries = 500;
toolbox.options.cache.maxAgeSeconds = 60 * 60 * 24 * (365.25 / 12);

const toCache = ['/js/main.js']
	.concat('/', '/404', '/offline')
	.concat('/fonts/Roboto-Regular.ttf', '/resources/vid.mp4')
	.concat('/about/manifest.json', '/about/images/48.png',
		'/about/images/72.png', '/about/images/96.png',
		'/about/images/144.png', '/about/images/168.png',
		'/about/images/192.png')

function getFromCache(path: string): RequestPromise {
	return (req, values, options): Promise<Response> => {
		return new Promise<Response>((resolve) => {
			caches.open(toolbox.options.cache.name).then((cache) => {
				cache.match(path).then((res) => {
					resolve(res);
				});
			});
		})
	}
}
toolbox.precache(toCache);

self.addEventListener('install', async (event) => {
	event.waitUntil(new Promise(async (resolve) => {
		
		toolbox.router.any('/', (req) => {
			return new Promise((resolve) => {
				let path: string;
				if (navigator.onLine) {
					path = '/';
				} else {
					path = '/offline'
				}
				caches.open(toolbox.options.cache.name).then((cache) => {
					cache.match(path).then((res) => {
						resolve(res);
					});
				})
			});
		});
		toolbox.router.any('/404', toolbox.fastest);
		toolbox.router.any('/fonts/*', toolbox.cacheOnly);
		toolbox.router.any('/css/(.*)_offline.css', toolbox.cacheOnly);
		toolbox.router.any('/css/(.*).css', toolbox.fastest);
		toolbox.router.any('/js/*', toolbox.fastest);
		toolbox.router.any('/resources/*', toolbox.fastest);
		toolbox.router.any('/about/*', toolbox.fastest);

		toolbox.router.default = (req, values, options) => {
			if (new URL(req.url).origin === self.location.origin) {
				if (req.mode === 'navigate') {
					return getFromCache('/404')(req, values, options)
				} else {
					return new Promise<Response>((resolve) => {
						resolve(new Response('', {
							status: 404,
							statusText: 'Not Found'
						}));
					});
				}
			} else {
				return fetch(req);
			}
		};

		resolve();
	}));
});