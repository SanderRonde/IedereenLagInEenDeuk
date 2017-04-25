declare module 'http2' {
	import * as tls from "tls";
	import * as http from 'http'

	export interface Server extends http.Server {}

	export function createServer(options: {
		log?: any;
		plain?: boolean;
		pfx?: any;
        key?: any;
        passphrase?: string;
        cert?: any;
        ca?: any;
        crl?: any;
        ciphers?: string;
        honorCipherOrder?: boolean;
        requestCert?: boolean;
        rejectUnauthorized?: boolean;
        NPNProtocols?: any;
        SNICallback?: (servername: string, cb: (err: Error, ctx: tls.SecureContext) => any) => any;
	}, requestListener?: Function): Server
}