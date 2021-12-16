import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';
import * as pathModule from 'path';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel } from '@mui/material';
import { LockfileContext } from './LockfileContext';
import * as files from '../libs/files';
import * as connections from '../libs/connections'

/*
    GET /lol-matchmaking/v1/ready-check	
    POST /lol-matchmaking/v1/ready-check/accept	
    POST /lol-matchmaking/v1/ready-check/decline
*/

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

    const initialQueueState = {
        state: QueueStateEnum.Unknown,
        timer: 0
    };
    const [queueState, setQueueState] = useState(initialQueueState);

    const [secondsToAccept, setSecondsToAccept] = useState(8);
    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);

    useEffect(() => {

        const updateFunction = () => {
            getQueueState(lockfileContent).then((state) => {
                setQueueState(state);

                if (state.state === QueueStateEnum.GameFound && state.timer >= secondsToAccept)
                    acceptQueue(lockfileContent);
            });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, 700));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent]);

    useEffect(() => {
        if(!enabled)
            setQueueState(initialQueueState);
    }, [enabled]);

    
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
            currentMessage = gameFoundMessage(secondsToAccept - queueState.timer, lockfileContent);
            break;
        }
        case QueueStateEnum.Declined: { 
            currentMessage = gameDeclinedMessage(lockfileContent);
            break;
        }
        case QueueStateEnum.Accepted: { 
            currentMessage = gameAcceptedMessage(lockfileContent);
            break;
        }
        case QueueStateEnum.Error: { 
            currentMessage = errorStateMessage("Don't know what happened but it's not good!");
            break;
        } 
    }

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnabled(event.target.checked);
    };

    const enablingSwitch = (
        <Switch
            color='success'
            checked={enabled}
            onChange={handleSwitchChange}
        />
    );

    const switchLabel = (<>Enable <strong>Smart Accept</strong></>);

    return (
        <Container>
            <Stack spacing={3}>
                <Stack>
                    <FormControlLabel control={enablingSwitch} label={switchLabel} />
                </Stack>
                <Stack>
                    {currentMessage}
                </Stack>
                <Stack>
                    <Alert severity="info">
                        <AlertTitle>When my game will be accepted?</AlertTitle>
                        After <strong>{secondsToAccept} {secondsToAccept > 1.1 ? "seconds" : "second"}</strong> since found, timing can adjust that with slider below.
                    </Alert>
                </Stack>
                <Stack>
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
        else if (clientResponse.state === "Invalid") return {
            state: QueueStateEnum.InQueue,
            timer: 0
        }
        else if (clientResponse.state === "InProgress") {
            // Game has been found, check whats user response
            if(clientResponse.playerResponse === "Declined") return {
                state: QueueStateEnum.Declined,
                timer: clientResponse.timer
            }
            else if(clientResponse.playerResponse === "Accepted") return {
                state: QueueStateEnum.Accepted,
                timer: clientResponse.timer
            }
            else return {
                state: QueueStateEnum.GameFound,
                timer: clientResponse.timer
            }
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

function declineQueue(lockfileContent: any): void {

    const {protocol, port, username, password} = lockfileContent;

    try {
        const endpointName = "lol-matchmaking/v1/ready-check/decline";
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
        <AlertTitle>You are in queue or in champion select</AlertTitle>
        Everthing looks good!<br/>
        Worry not, any game will be <strong>accepted after {acceptTimeThreshold} {acceptTimeThreshold > 1.1 ? "seconds" : "second"}</strong> since found.
        You will have some time to <strong>decline</strong>!
    </Alert>
);

const gameFoundMessage = (timeToAccept: number, lockfileContent: any) => (
    <Alert severity="success">
        <AlertTitle>Game found!</AlertTitle>
        Game has been found, it will be accepted in <strong>{timeToAccept} {timeToAccept > 1.1 ? "seconds" : "second"}</strong>!
        If you don't wish to play right now <strong>decline</strong> ASAP!
        <br/>
        <br/>
        <Button onClick={() => declineQueue(lockfileContent)} variant="contained" color="error">DECLINE</Button>
    </Alert>
);

const gameAcceptedMessage = (lockfileContent: any) => (
    <Alert severity="success">
        <AlertTitle>Game accepted</AlertTitle>
        Game has been <strong>accepted</strong>, have fun!
        <br/>
        <br/>
        <Button onClick={() => declineQueue(lockfileContent)} variant="contained" color="error">FORCE DECLINE ANYWAY</Button>
    </Alert>
);

const gameDeclinedMessage = (lockfileContent: any) => (
    <Alert severity="error">
        <AlertTitle>Game declined</AlertTitle>
        Game has been <strong>declined</strong>, see you later!
        <br/>
        <br/>
        <Button onClick={() => acceptQueue(lockfileContent)} variant="contained" color="success">FORCE ACCEPT ANYWAY</Button>
    </Alert>
);

const unknownStateMessage = (
    <Alert severity="info">
        <AlertTitle>State is unknown</AlertTitle>
        Can't tell what is happening.<br/>
        Smart Accept is likely <strong>disabled</strong>.<br/>
        If Smart Accept is <strong>enabled</strong> and problem persists please <strong>restart</strong> your League client.
    </Alert>
);

const errorStateMessage = (error: string) => (
    <Alert severity="error">
        <AlertTitle>An error has occured</AlertTitle>
        <strong>Error message:</strong> {error}
    </Alert>
);