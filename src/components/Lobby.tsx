import { Container, Button, Stack, Divider, LinearProgress } from '@mui/material';
import React, { ReactElement, FC, useState } from 'react';
import { Team, TeamProp } from './Team';

import * as clientLockfile from '../jsutils/clientLockfile.js';

//TODO Lobby should be able to do client requests
//TODO provide data form lockfile

export const Lobby: FC<any> = (): ReactElement => {
    const initialState: any = {
        bans: [],
        leftTeam: [],
        rightTeam: [],
        localPlayerCellId: null,
        localPlayerTeamId: null,
        gameId: null
    };

    const [lobbyState, setLobbyState] = useState(initialState);

    const tmp: TeamProp = {
        summoners: [], 
        localPlayerCellId: 1
    }

    const updateLobby = async () => {
        // const lobbyState = await parsedLobbyState(lockfileState.port, lockfileState.password);
        const lobbyState = await clientLockfile.mockedParsedLobbyState();
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