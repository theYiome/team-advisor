import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';
import * as pathModule from 'path';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle } from '@mui/material';
import { LockfileContext } from './LockfileContext';
import * as files from '../libs/files';
import * as connections from '../libs/connections'

/*
    GET /lol-matchmaking/v1/ready-check	
    POST /lol-matchmaking/v1/ready-check/accept	
    POST /lol-matchmaking/v1/ready-check/decline
*/

// TODO: implement Declined state
// TODO: implement Accepted state

enum QueueStateEnum {
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
    state: QueueStateEnum,
    timer: number
}

export const SmartAccept: FC<any> = (): ReactElement => {

    const [enabled, setEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);

    const [queueState, setQueueState] = useState({
        state: QueueStateEnum.Unknown,
        timer: 0
    });
    const [secondsToAccept, setSecondsToAccept] = useState(8);
    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);

    useEffect(() => {

        const updateFunction = () => {
            getQueueState(lockfileContent).then((state) => {
                setQueueState(state);
                if (state.timer >= secondsToAccept) acceptQueue(lockfileContent);
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

    let currentMessage = unknownStateMessage;

    switch(queueState.state) { 
        case QueueStateEnum.NoClient: { 
            currentMessage = noClientMessage;
            break; 
        } 
        case QueueStateEnum.NoInQueue: { 
            currentMessage = noInQueueMessage;
            break; 
        } 
        case QueueStateEnum.InQueue: { 
            currentMessage = inQueueMessage(secondsToAccept);
            break; 
        }
        case QueueStateEnum.GameFound: { 
            currentMessage = gameFoundMessage(secondsToAccept - queueState.timer);
            break;
        }
        case QueueStateEnum.Error: { 
            currentMessage = errorStateMessage("Don't know what happened but it's not good!");
            break;
        } 
    } 

    return (
        <Container>
            <Stack spacing={3}>
                <Stack>
                    {currentMessage}
                </Stack>
                <Stack>
                    <Typography>Is smart accept enabled: </Typography>
                    <Button variant="contained" onClick={() => setEnabled(!enabled)}>{enabled.toString()}</Button> 
                </Stack>
                <Stack>
                    <Typography>Accept at [seconds]:</Typography>
                    <Slider onChange={handleTimeChange} value={secondsToAccept} valueLabelDisplay="auto" step={1} marks min={1} max={12}/>
                </Stack>
            </Stack>
        </Container>
    );
}

async function getQueueState(lockfileContent: any): Promise<QueueState> {

    const {protocol, port, username, password} = lockfileContent;

    if (username === "") return {
        state: QueueStateEnum.NoClient,
        timer: 0
    }

    try {
        const endpointName = "lol-matchmaking/v1/ready-check";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const clientResponse: any = await connections.fetchJSON(url);
        console.log(clientResponse);

        if (clientResponse.message === "Not attached to a matchmaking queue.") return {
            state: QueueStateEnum.NoInQueue,
            timer: 0
        }
        else if (clientResponse.timer === 0) return {
            state: QueueStateEnum.InQueue,
            timer: 0
        }
        else if (clientResponse.timer >= 0) return {
            state: QueueStateEnum.GameFound,
            timer: clientResponse.timer
        }
        else return {
            state: QueueStateEnum.Unknown,
            timer: 0
        }
    } 
    catch(err) {
        console.warn(err);
        return {
            state: QueueStateEnum.Error,
            timer: 0
        }
    }
}

function acceptQueue(lockfileContent: any): void {

    const {protocol, port, username, password} = lockfileContent;

    try {
        const endpointName = "lol-matchmaking/v1/ready-check/accept";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        connections.fetchJSON(url, { method: 'POST' }).then((clientResponse) => {
            console.log(clientResponse);
        });
    } 
    catch(err) {
        console.warn(err);
    }
}

const noClientMessage = (
    <Alert severity="error">
        <AlertTitle>Failed to load data from lockfile</AlertTitle>
        Either <strong>client is not running</strong> or <strong>given installation path is incorrect</strong>.
        Remember to choose your League instalation directory!
    </Alert>
);

const noInQueueMessage = (
    <Alert severity="warning">
        <AlertTitle>You are not yet in queue</AlertTitle>
        Waiting for you to click <strong>FIND MATCH</strong>.
    </Alert>
);

const inQueueMessage = (acceptTimeThreshold: number) => (
    <Alert severity="info">
        <AlertTitle>You are in queue</AlertTitle>
        Worry not, game will be <strong>accepted after {acceptTimeThreshold} seconds</strong> since found.
        You will have some time to <strong>decline</strong>!
    </Alert>
);

const gameFoundMessage = (timeToAccept: number) => (
    <Alert severity="success">
        <AlertTitle>Game found!</AlertTitle>
        Game has been found, it will be accepted in <strong>{timeToAccept} seconds</strong>!
        If you don't wish to play right now <strong>decline</strong> ASAP!
    </Alert>
);

const unknownStateMessage = (
    <Alert severity="info">
        <AlertTitle>State is unknown</AlertTitle>
        Can't tell what is happening. Smart Accept is likely <strong>disabled</strong>.
    </Alert>
);

const errorStateMessage = (error: string) => (
    <Alert severity="error">
        <AlertTitle>An error has occured</AlertTitle>
        <strong>Error message:</strong> {error}
    </Alert>
);