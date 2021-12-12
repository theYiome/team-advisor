import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';
import * as pathModule from 'path';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider } from '@mui/material';
import { LockfileContext } from './LockfileContext';
import * as files from '../libs/files';
import * as connections from '../libs/connections'

/*
    GET /lol-matchmaking/v1/ready-check	
    POST /lol-matchmaking/v1/ready-check/accept	
    POST /lol-matchmaking/v1/ready-check/decline
*/

export const SmartAccept: FC<any> = (): ReactElement => {

    const [enabled, setEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    // const [queueState, setQueueState] = useState(null);
    const [secondsSinceFound, setSecondsSinceFound] = useState(0);
    const [secondsToAccept, setSecondsToAccept] = useState(8);
    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);

    useEffect(() => {

        const updateFunction = () => {
            inQueue(lockfileContent).then((timer) => {
                setSecondsSinceFound(timer);
                if (timer >= secondsToAccept) {
                    acceptQueue(lockfileContent);
                }
            });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, 700));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent]);

    
    const handleTimeChange = (event: Event, newValue: number, activeThumb: number) => {
        setSecondsToAccept(newValue);
    };

    return (
        <Stack spacing={2}>
            <Stack sx={{p: 2}}>
                <Stack>
                    <Typography>Is smart accept enabled: </Typography>
                    <Button variant="contained" onClick={() => setEnabled(!enabled)}>{enabled.toString()}</Button> 
                </Stack>
                <Stack>
                    <Typography>Accept at [seconds]:</Typography>
                    <Slider onChange={handleTimeChange} defaultValue={10} valueLabelDisplay="auto" step={1} marks min={1} max={12}/>
                </Stack>
                <Stack sx={{p: 2}}>
                    {secondsSinceFound ? `Game found ${secondsSinceFound} seconds ago` : "Nothing to see here"}
                </Stack>
            </Stack>
        </Stack>
    );
}

async function inQueue(lockfileContent: any): Promise<number> {

    const {protocol, port, username, password} = lockfileContent;

    try {
        const endpointName = "lol-matchmaking/v1/ready-check";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const clientResponse: any = await connections.fetchJSON(url);
        console.log(clientResponse);
        return clientResponse.timer;
    } 
    catch(err) {
        console.warn(err);
        return null
    }
}

async function acceptQueue(lockfileContent: any): Promise<number> {

    const {protocol, port, username, password} = lockfileContent;

    try {
        const endpointName = "lol-matchmaking/v1/ready-check/accept";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const clientResponse: any = await connections.fetchJSON(url, { method: 'POST' });
        console.log(clientResponse);
        return clientResponse.timer;
    } 
    catch(err) {
        console.warn(err);
        return null
    }
}