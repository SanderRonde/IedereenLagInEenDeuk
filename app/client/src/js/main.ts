/// <reference path="../../../../typings/client.d.ts" />

if (navigator.onLine && location.protocol === 'https:') {
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
const replayEl = document.getElementsByClassName('replayVideoContainer')[0] as HTMLElement;


function calcReplayElSize() {
	const bcr = vid.getBoundingClientRect();
	replayEl.style.height = bcr.height + 'px';
	replayEl.style.width = (bcr.height * (16 / 9)) + 'px';
}

function onVidPlay() {
	if (replayEl.classList.contains('autoplayDisabled')) {
		window.setTimeout(() => {
			replayEl.classList.remove('autoplayDisabled');
		}, 250);
	}

	vid.pause();
	vid.currentTime = 0;
	vid.play();

	vid.classList.remove('ended');
	replayEl.classList.remove('visible');
}

window.onresize = () => {
	if (vid.classList.contains('ended')) {
		calcReplayElSize();
	}
}

vid.addEventListener('ended', () => {
	calcReplayElSize();
	vid.classList.add('ended');
	replayEl.classList.add('visible');
});

replayEl.addEventListener('click', () => {
	onVidPlay();
});
replayEl.addEventListener('keydown', (e) => {
	if ((e.which || e.keyCode) === 32 || //Spacebar
		(e.which || e.keyCode) === 13) { //Enter
			onVidPlay();
		}
});


vid.onloadeddata = () => {
	const vidPlayResult = vid.play();
	if (vidPlayResult) {
		((vidPlayResult as any) as Promise<any>).catch((err) => {
			//If this thrown an error, autoplay is disabled
			calcReplayElSize();
			replayEl.classList.add('autoplayDisabled', 'visible');
			vid.classList.add('ended');
		});
	}
}