/// <reference path="serviceworker/sw-toolbox.d.ts" />

/**
 * Copyright (c) 2016, Tiernan Cridland
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby
 * granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 *
 * Typings for Service Worker
 * @author Tiernan Cridland
 * @email tiernanc@gmail.com
 * @license: ISC
 */

interface ExtendableEvent extends Event {
	waitUntil(fn: Promise<any>): void;
}


interface ServiceWorkerNotificationOptions {
	tag?: string;
}

interface NotificationOptions {
	renotify?: boolean;
	actions?: Array<{
		action?: string;
		title?: string;
	}>;
}

interface ServiceWorkerRegistration {
	getNotifications(options?: ServiceWorkerNotificationOptions): Promise<Array<Notification>>;
	update(): void;
	unregister(): Promise<boolean>;
	showNotification(title: string, options?: NotificationOptions): NotificationEvent;
}

interface ServiceWorkerRegistrationOptions {
	scope?: string;
}

type ServiceWorkerState = "installing" | "installed" | "activating" | "activated" | "redundant";

// CacheStorage API

interface Cache {
	add(request: Request): Promise<void>;
	addAll(requestArray: Array<Request>): Promise<void>;
	'delete'(request: Request, options?: CacheStorageOptions): Promise<boolean>;
	keys(request?: Request, options?: CacheStorageOptions): Promise<Array<string>>;
	match(request: Request, options?: CacheStorageOptions): Promise<Response>;
	matchAll(request: Request, options?: CacheStorageOptions): Promise<Array<Response>>;
	put(request: Request|string, response: Response): Promise<void>;
}

interface CacheStorage {
	'delete'(cacheName: string): Promise<boolean>;
	has(cacheName: string): Promise<boolean>;
	keys(): Promise<Array<string>>;
	match(request: Request, options?: CacheStorageOptions): Promise<Response>;
	open(cacheName: string): Promise<Cache>;
}

interface CacheStorageOptions {
	cacheName?: string;
	ignoreMethod?: boolean;
	ignoreSearch?: boolean;
	ignoreVary?: boolean;
}

// Client API

interface Client {
	frameType: ClientFrameType;
	id: string;
	url: string;
}

interface Clients {
	claim(): Promise<any>;
	get(id: string): Promise<Client>;
	matchAll(options?: ClientMatchOptions): Promise<Array<Client>>;
	openWindow(url: string): Promise<WindowClient>;
}

interface ClientMatchOptions {
	includeUncontrolled?: boolean;
	type?: ClientMatchTypes;
}

interface WindowClient {
	focused: boolean;
	visibilityState: WindowClientState;
	focus(): Promise<WindowClient>;
	navigate(url: string): Promise<WindowClient>;
}

type ClientFrameType = "auxiliary" | "top-level" | "nested" | "none";
type ClientMatchTypes = "window" | "worker" | "sharedworker" | "all";
type WindowClientState = "hidden" | "visible" | "prerender" | "unloaded";

interface FetchEvent extends Event {
	request: Request;
	respondWith(response: Promise<Response>|Response): Promise<Response>;
}

interface InstallEvent extends ExtendableEvent {
	activeWorker: ServiceWorker
}

interface ActivateEvent extends ExtendableEvent {
}

interface NotificationEvent {
	action: string;
	notification: Notification;
}

// Push API

interface PushEvent extends ExtendableEvent {
	data: PushMessageData;
}

interface PushManager {
	getSubscription(): Promise<PushSubscription>;
	permissionState(): Promise<string>;
	subscribe(): Promise<PushSubscription>;
}

interface PushMessageData {
	arrayBuffer(): ArrayBuffer;
	blob(): Blob;
	json(): any;
	text(): string;
}
// Sync API

interface SyncEvent extends Event {
	lastChance: boolean;
	tag: string;
}

// ServiceWorkerGlobalScope

declare var clients: Clients;
declare var onactivate: (event?: ExtendableEvent) => any;
declare var onfetch: (event?: FetchEvent) => any;
declare var oninstall: (event?: ExtendableEvent) => any;
declare var onmessage: (event: MessageEvent) => any;
declare var onnotificationclick: (event?: NotificationEvent) => any;
declare var onnotificationclose: (event?: NotificationEvent) => any;
declare var onpush: (event?: PushEvent) => any;
declare var onpushsubscriptionchange: () => any;
declare var onsync: (event?: SyncEvent) => any;
declare var registration: ServiceWorkerRegistration;

declare function fetch(request: Request|string): Promise<Response>;
declare function skipWaiting(): void;

interface Window {
	addEventListener(type: 'push', callback: (event: PushEvent) => void): void;
	addEventListener(type: 'install', callback: (event: ExtendableEvent) => void): void;
	addEventListener(type: 'notificationclick', callback: (event: NotificationEvent) => void): void;
	addEventListener(type: 'notificationclose', callback: (event: NotificationEvent) => void): void;
	addEventListener(type: 'pushsubscriptionchange', callback: (event: ExtendableEvent) => void): void;

	registration: ServiceWorkerRegistration
}