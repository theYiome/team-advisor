import * as connections from './connections';

async function rawLcuRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchRaw(url, options)
}

async function jsonLcuRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchJSON(url, options)
}

export { rawLcuRequest, jsonLcuRequest };