declare var toolbox: Toolbox;

interface ToolboxOptions {
	debug?: boolean;
	networkTimeoutSeconds?: number;
	cache?: {
		name?: string;
		maxEntries?: number;
		maxAgeSeconds?: number;
	}
} 

type RequestHandler = (request: Request, values: { [key: string ]: string }, options?: ToolboxOptions)
						 => Response|Promise<Response>

type RequestPromise = (request: Request, values: { [key: string ]: string }, options?: ToolboxOptions)
						 => Promise<Response> 

type RouterFunction = (urlPattern: RegExp|string, handler: RequestHandler|RequestPromise, options?: ToolboxOptions)
							=> void

interface Toolbox {
	networkFirst: RequestPromise;
	networkOnly: RequestPromise;
	cacheFirst: RequestPromise;
	cacheOnly: RequestPromise;
	fastest: RequestPromise;
	router: {
		any: RouterFunction;
		get: RouterFunction;
		put: RouterFunction;
		post: RouterFunction;
		head: RouterFunction;
		delete: RouterFunction;
		
		default: RequestPromise;
	}

	options: ToolboxOptions;
	precache: (urls: Array<string>) => void;
	cache: (url: string, options?: ToolboxOptions) => void;
	uncache: (url: string, options: ToolboxOptions) => Promise<boolean>
}