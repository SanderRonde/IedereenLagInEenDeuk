/// <reference path="../../../../typings/client.d.ts" />

function main() {
	if (navigator.onLine) {
		navigator.serviceWorker.register('/serviceworker.js');
	}

	const offlineIndicator = document.getElementById('networkStatus');
	window.addEventListener('online', () => {
		offlineIndicator.classList.remove('hidden');
	});
	window.addEventListener('offline', () => {
		offlineIndicator.classList.add('hidden');
	});
}