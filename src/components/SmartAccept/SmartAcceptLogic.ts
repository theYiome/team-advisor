import * as connections from '../../libs/connections';

enum QueuePhase {
    NoClient,
    NoInQueue,
    InQueue,
    GameFound,
    Declined,
    Accepted,
    Unknown,
    Error
}

type QueueState = {
    state: QueuePhase,
    timer: number
}

async function getQueueState(lockfileContent: any): Promise<QueueState> {

    const { protocol, port, username, password } = lockfileContent;

    if (username === "") return {
        state: QueuePhase.NoClient,
        timer: 0
    }

    try {
        const endpointName = "lol-matchmaking/v1/ready-check";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const clientResponse: any = await connections.fetchJSON(url);
        console.log(clientResponse);

        if (clientResponse.message === "Not attached to a matchmaking queue.") {

            const endpointName = "/lol-champ-select/v1/session";
            const urlWithAuth = connections.clientURL(port, password, username, protocol);
            const url = urlWithAuth + endpointName;
    
            const clientResponse: any = await connections.fetchJSON(url);
            console.log(clientResponse);
            
            return {
                state: QueuePhase.NoInQueue,
                timer: 0
            }
        }
        else if (clientResponse.state === "Invalid") return {
            state: QueuePhase.InQueue,
            timer: 0
        }
        else if (clientResponse.state === "InProgress") {
            // Game has been found, check whats user response
            if (clientResponse.playerResponse === "Declined") return {
                state: QueuePhase.Declined,
                timer: clientResponse.timer
            }
            else if (clientResponse.playerResponse === "Accepted") return {
                state: QueuePhase.Accepted,
                timer: clientResponse.timer
            }
            else return {
                state: QueuePhase.GameFound,
                timer: clientResponse.timer
            }
        }
        else return {
            state: QueuePhase.Unknown,
            timer: 0
        }
    }
    catch (err) {
        console.warn(err);
        return {
            state: QueuePhase.Error,
            timer: 0
        }
    }
}

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

export { QueuePhase, QueueState, getQueueState, acceptQueue, declineQueue };