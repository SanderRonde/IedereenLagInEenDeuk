/// <reference path="../../../../typings/client.d.ts" />

const toasts: Array<Toast> = [];
export class Toast {
	element: HTMLElement;

	constructor(public text: string, public duration: number, buttons: Array<{
		text: string;
		callback(): void;
	}> = []) {
		this.element = this.createElement(buttons);
		this.showWhenReady();
		toasts.push(this);
	}

	private showWhenReady() {
		if (toasts.length === 0) {
			window.setTimeout(() => {
				this.show();
			}, 10);
		}
	}

	hide() {
		this.element.classList.add('hidden');
		window.setTimeout(() => {
			this.destroy();
		}, 1000);
	}

	private destroy() {
		this.element.remove();

		toasts.splice(toasts.indexOf(this), 1);
		if (toasts[0]) {
			toasts[0].show();
		}
	}

	show() {
		this.element.classList.remove('hidden');
		window.setTimeout(() => {
			this.hide();
		}, this.duration);
	}

	private createButton(text: string, onclick: () => void): HTMLElement {
		const elButton = document.createElement('span');
		elButton.classList.add('toastDismiss');
		elButton.classList.add('fancyOnClick');
		elButton.addEventListener('click', onclick);
		elButton.innerText = text;
		return elButton;
	}

	private createElement(buttons: Array<{
		text: string;
		callback(): void;
	}>): HTMLElement {
		const el = document.createElement('div');
		el.classList.add('toast','hidden');

		const elText = document.createElement('div');
		elText.classList.add('toastText');
		elText.innerText = this.text;

		el.appendChild(elText);

		buttons.forEach((button) => {
			el.appendChild(this.createButton(button.text, button.callback));
		});
		el.appendChild(this.createButton('WEGDOEN', this.hide.bind(this)));

		document.body.appendChild(el);

		return el;
	}
}

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