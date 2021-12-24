import * as connections from '../libs/connections'

async function rawClientRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchRaw(url, options)
}

async function jsonClientRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchJSON(url, options)
}

export { rawClientRequest, jsonClientRequest };