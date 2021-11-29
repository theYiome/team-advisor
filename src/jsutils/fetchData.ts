import request from 'request';

async function asyncFetch(url: string): Promise<string> {

    return new Promise((resolve, reject) => {
        let options = { };

        request(url, options, (error, res, body) => {

            if (error) {
                console.log(error);
                reject(error);
            }

            resolve(body);
        });

    });
}

export async function fetchJSON(url: string) {
    return asyncFetch(url).then(rawData => JSON.parse(rawData));
}