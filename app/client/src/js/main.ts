/// <reference path="../../../../typings/client.d.ts" />

if (navigator.onLine) {
	navigator.serviceWorker.register('/serviceworker.js');
}

const offlineIndicator = document.getElementById('networkStatus');
window.addEventListener('online', () => {
	offlineIndicator.classList.add('hidden');
});
window.addEventListener('offline', () => {
	offlineIndicator.classList.remove('hidden');
});
if (!navigator.onLine) {
	offlineIndicator.classList.remove('hidden');
}
const vid = (document.getElementById('video') as HTMLVideoElement);
document.getElementById('replayButton').addEventListener('click', () => {
	vid.pause();
	vid.currentTime = 0;
	vid.play();
});