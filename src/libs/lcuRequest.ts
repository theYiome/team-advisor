import { LcuCredentials } from '../components/LcuProvider';
import * as connections from './connections';

async function rawLcuRequest(lockfileContent: LcuCredentials, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchRaw(url, options)
}

async function jsonLcuRequest(lockfileContent: LcuCredentials, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchJSON(url, options)
}

export { rawLcuRequest, jsonLcuRequest };