import * as connections from '../../libs/connections';

function acceptQueue(lockfileContent: any): void {

    const { protocol, port, username, password } = lockfileContent;

    try {
        const endpointName = "lol-matchmaking/v1/ready-check/accept";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        connections.fetchRaw(url, { method: 'POST' }).catch(error => console.error(error));
    }
    catch (err) {
        console.warn(err);
    }
}

function declineQueue(lockfileContent: any): void {

    const { protocol, port, username, password } = lockfileContent;

    try {
        const endpointName = "lol-matchmaking/v1/ready-check/decline";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        connections.fetchRaw(url, { method: 'POST' }).catch(error => console.error(error));
    }
    catch (err) {
        console.warn(err);
    }
}

export { acceptQueue, declineQueue };