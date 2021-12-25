import { Container, Button, Stack, Divider, LinearProgress } from '@mui/material';
import React, { ReactElement, FC, useState, useContext } from 'react';
import { Team, TeamProp } from './Team';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import * as connections from '../libs/connections'
import * as files from '../libs/files'

import { ChampionSelectPhase, getChampionSelectState, hoverChampion } from '../componentLibs/championSelect';
import { appInControl, banningMessage, inChampionSelectMessage, noInChampionSelectMessage, pickedMessage, pickingMessage, planningMessage, unknownMessage, userInControl } from './ChampionSelectMessages';


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

    const [champions, setChampions] = useContext(ChampionsContext);

    const updateLobby = async () => {
        const lobbyState = await getChampionSelectState(lockfileContent);
        // const lobbyState = await mockedParsedLobbyState();

        console.log(lobbyState);
        setLobbyState(lobbyState);
    }

    const bansView = lobbyState.bans.length > 0 ? 
        lobbyState.bans.map((ban: any) => 
            <Stack key={ban} sx={{p: 2, boxShadow: 2, textAlign: "center"}}>
                {champions[ban]}
            </Stack>) : 
        <LinearProgress/>;

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


// export async function mockedParsedLobbyState() {

//     const clientResponse = await files.loadJSON("data/lol-champ-select--v1--session.json");

//     console.log(clientResponse);
//     // if(!clientResponse) throw "Lobby state request failed";

//     const playerTeamId = clientResponse.myTeam[0].team;
//     const leftTeam = playerTeamId === 1 ? clientResponse.myTeam : clientResponse.theirTeam;
//     const rightTeam = playerTeamId === 2 ? clientResponse.myTeam : clientResponse.theirTeam;
//     return {
//         bans: getBans(clientResponse),
//         gameId: clientResponse.gameId,
//         localPlayerCellId: clientResponse.localPlayerCellId,
//         localPlayerTeamId: playerTeamId,
//         leftTeam: leftTeam,
//         rightTeam: rightTeam
//     };
// }