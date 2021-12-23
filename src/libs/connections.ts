import request from "request";

export function asyncFetch(url: string, options: any = {}): Promise<string> {

    return new Promise(
        (resolve, reject) => {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            request(url, options, (error, res, body) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                resolve(body);
            });
        }
    );
}

export async function fetchRaw(url: string, options: any = {}) {
    return asyncFetch(url, options);
}

export async function fetchJSON(url: string, options: any = {}) {
    return asyncFetch(url, options).then(rawData => JSON.parse(rawData));
}

export function clientURL(port: string, password: any, username: any, protocol: string) {
    return `${protocol}://${username.toString('base64')}:${password.toString('base64')}@127.0.0.1:${port}/`;
}