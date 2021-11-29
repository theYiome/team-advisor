// var fsPromises = require("fs").promises;
import * as fsPromises from 'node:fs/promises';
import * as nodefetch from 'node-fetch';

const fetch = nodefetch.default;

async function checkLock() {
    const fileData = await getDataFromFile(lockfilePath);
    const parsedData = parseLockfile(fileData);
    const clientResponse = await makeClientAPIRequest(parsedData.port, parsedData.password);
    if (clientResponse) {
        console.log(clientResponse.myTeam);
        console.log(clientResponse.theirTeam);
        console.log(getBans(clientResponse));
    } else {
        throw "Not in champion select?";
    }
}

function getBans(lobbyState) {
    const bans = [];
    for (const phase of lobbyState.actions) {
        for (const action of phase) {
            if (action.type === "ban" && action.championId != 0)
                bans.push(action.championId);
        }
    }
    return bans;
}

async function parsedLobbyState(port, password) {
    const clientResponse = await makeClientAPIRequest(port, password);
    console.log(clientResponse);
    if(!clientResponse) throw "Lobby state request failed";

    const playerTeamId = clientResponse.myTeam[0].team;
    const leftTeam = playerTeamId === 1 ? clientResponse.myTeam : clientResponse.theirTeam;
    const rightTeam = playerTeamId === 2 ? clientResponse.myTeam : clientResponse.theirTeam;
    return {
        bans: getBans(clientResponse),
        gameId: clientResponse.gameId,
        localPlayerCellId: clientResponse.localPlayerCellId,
        localPlayerTeamId: playerTeamId,
        leftTeam: leftTeam,
        rightTeam: rightTeam
    };
}

export async function mockedParsedLobbyState() {
    const data = await getDataFromFile("data/lol-champ-select--v1--session.json");
    // console.log(data);
    // console.log(data.buffer[11456]);
    // console.log(data.buffer.toString());

    const clientResponse = JSON.parse(bufferToValidString(data.buffer));
    console.log(clientResponse);
    if(!clientResponse) throw "Lobby state request failed";

    const playerTeamId = clientResponse.myTeam[0].team;
    const leftTeam = playerTeamId === 1 ? clientResponse.myTeam : clientResponse.theirTeam;
    const rightTeam = playerTeamId === 2 ? clientResponse.myTeam : clientResponse.theirTeam;
    return {
        bans: getBans(clientResponse),
        gameId: clientResponse.gameId,
        localPlayerCellId: clientResponse.localPlayerCellId,
        localPlayerTeamId: playerTeamId,
        leftTeam: leftTeam,
        rightTeam: rightTeam
    };
}

function bufferToValidString(buffer) {
    return buffer.toString().replace(/\0/g, '').trim();
}

export function parseLockfile(fileData) {
    // https://stackoverflow.com/questions/22809401/removing-a-null-character-from-a-string-in-javascript
    const fileString = bufferToValidString(fileData.buffer);
    const fileArray = fileString.split(":");

    console.log(fileArray);
    if (fileArray.length < 5) {
        throw `At least 5 strings required, ${fileArray.length} found.
        String is "${fileString}"`;
    }

    return {
        protocol: fileArray[4],
        port: fileArray[2],
        username: "riot",
        password: fileArray[3],
    }
}

export async function getDataFromFile(path) {
    let fileData = null;
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path);
        fileData = await file.read();
        file.close();
    }
    catch (err) {
        const errorStr = `Client not open?`;
        console.log(errorStr, err);
        throw errorStr;
    }

    return fileData;
}

async function makeClientAPIRequest(port, password, username="riot", protocol="https") {
    const requestPrefix = `${protocol}://127.0.0.1:${port}/lol-champ-select/v1/session`;
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + Buffer.from(username + ":" + password).toString('base64'));

    let result = null;
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const response = await fetch(requestPrefix, {headers: headers});
        console.log(response);

        if (response.status === 200) {
            result = response.json();
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }

    return result;
}