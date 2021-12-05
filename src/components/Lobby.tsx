import { Container, Button, Stack, Divider, LinearProgress } from '@mui/material';
import React, { ReactElement, FC, useState, useContext } from 'react';
import { Team, TeamProp } from './Team';

import { LockfileContext } from './LockfileContext';

import * as connections from '../libs/connections'
import * as files from '../libs/files'

const initialState: any = {
    bans: [],
    leftTeam: [],
    rightTeam: [],
    localPlayerCellId: null,
    localPlayerTeamId: null,
    gameId: null
};

export const Lobby: FC<any> = (): ReactElement => {

    const [lobbyState, setLobbyState] = useState(initialState);
    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);

    const tmp: TeamProp = {
        summoners: [], 
        localPlayerCellId: 1
    }

    const updateLobby = async () => {
        // console.log(lockfileContent);
        const {protocol, port, username, password} = lockfileContent;
        // const lobbyState = await parsedLobbyState(port, password, username, protocol);
        const lobbyState = await mockedParsedLobbyState();
        console.log(lobbyState);
        setLobbyState(lobbyState);
    }

    const bansView = lobbyState.bans.length > 0 ? lobbyState.bans.map((ban: any) => <Stack key={ban} sx={{p: 2, boxShadow: 2, textAlign: "center"}}>{ban}</Stack>) : <LinearProgress/>;

    return (
        <Stack divider={<Divider orientation="horizontal" flexItem />} spacing={2}>

            <Stack direction="row" sx={{p: 2}}>
                <Container>
                    <Team {...{summoners: lobbyState.leftTeam, localPlayerCellId: lobbyState.localPlayerCellId}}></Team>
                </Container>

                <Stack spacing={2}>
                    {<Stack key="ban" sx={{p: 2, boxShadow: 2}}>Bans</Stack>}
                    {bansView}
                </Stack>
                
                <Container>
                    <Team {...{summoners: lobbyState.rightTeam, localPlayerCellId: lobbyState.localPlayerCellId}}></Team>
                </Container>
            </Stack>

            <Stack sx={{p: 2}}>
                <Button variant="contained" onClick={updateLobby}>Update lobby</Button> 
            </Stack>
        </Stack>
    );
}


function getBans(lobbyState: any) {
    const bans = [];
    for (const phase of lobbyState.actions) {
        for (const action of phase) {
            if (action.type === "ban" && action.championId != 0)
                bans.push(action.championId);
        }
    }
    return bans;
}


async function parsedLobbyState(port: string, password: string, username: string, protocol: string) {
    try {
        const endpointName = "lol-champ-select/v1/session";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const clientResponse: any = await connections.fetchJSON(url);
        console.log(clientResponse);

        // parse and return state
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
    catch(err) {
        // parsing failed, return blank state
        console.warn(err);
        return initialState;
    }
}


export async function mockedParsedLobbyState() {

    const clientResponse = await files.loadJSON("data/lol-champ-select--v1--session.json");

    console.log(clientResponse);
    // if(!clientResponse) throw "Lobby state request failed";

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