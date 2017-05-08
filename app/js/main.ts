const vid = (document.getElementById('video') as HTMLVideoElement);
const replayEl = document.getElementById('replayVideoContainer') as HTMLElement;

function onVidPlay() {
	vid.pause();
	vid.currentTime = 0;
	vid.play();

	replayEl.classList.remove('visible');
}

vid.addEventListener('ended', () => {
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