/// <reference path="../../../../typings/client.d.ts" />

const toasts: Array<Toast> = [];
class Toast {
	element: HTMLElement;

	constructor(public text: string, public duration: number, buttons: Array<{
		text: string;
		callback(toast: Toast): void;
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
			toasts.splice(toasts.indexOf(this), 1);
			if (toasts[0]) {
				toasts[0].show();
			}
		}, 500);

		window.setTimeout(() => {
			this.element.remove();
		}, 1000);
	}

	show() {
		this.element.classList.remove('hidden');
		window.setTimeout(() => {
			this.hide();
		}, this.duration);
	}

	private createButton(text: string, onclick: (toast: Toast) => void): HTMLElement {
		const elButton = document.createElement('span');
		elButton.classList.add('toastButton');
		elButton.classList.add('fancyOnClick');
		elButton.addEventListener('click', () => {
			onclick(this);
		});
		elButton.innerText = text;
		return elButton;
	}

	private createElement(buttons: Array<{
		text: string;
		callback(toast: Toast): void;
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

		document.body.appendChild(el);

		return el;
	}
}

if ('serviceWorker' in navigator) {
	(async () => {
		if (navigator.onLine && (location.protocol === 'https:' || location.host === 'localhost')) {
			const registration = await navigator.serviceWorker.register('/serviceworker.js');

			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				registration.installing.addEventListener('statechange', async () => {
					if (newWorker.state == 'activated' && !navigator.serviceWorker.controller) {
						new Toast('Pagina werkt nu offline', 5000, [{
							text: 'Echt?',
							callback(toast) {
								new Toast('Ja echt', 5000, [{
									text: 'Dat kan toch niet',
									callback(toast) {
										new Toast('Toch wel, probeer dan', 5000, [{
											text: 'Oke',
											callback(toast) {
												localStorage.setItem('msgOnOfflineServe', 'true');
												toast.hide();
											}
										}]);
										toast.hide();
									}
								}]);
								toast.hide();
							}
						}, {
							text: 'Cool',
							callback(toast) {
								toast.hide();
							}
						}]);		
					}
				});
			});
		}

		navigator.serviceWorker.addEventListener('message', (event) => {
			const msg: {
				type: string;
				data: any;
			} = event.data;
			if (msg.type === 'offlineServe') {
				if (localStorage.getItem('msgOnOfflineServe')) {
					new Toast('Ik zei het toch joh', 2500);
					localStorage.removeItem('msgOnOfflineServe');
				}
			}
		});
	})();
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