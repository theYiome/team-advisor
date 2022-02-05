import React from 'react';
import { Button, Alert, AlertTitle } from '@mui/material';
import { declineQueue, acceptQueue } from './SmartAcceptLogic';

const noInQueueMessage = (
    <Alert severity="warning">
        <AlertTitle>You are not yet in queue</AlertTitle>
        Waiting for you to click <strong>FIND MATCH</strong>.
    </Alert>
);

const inQueueMessage = (acceptTimeThreshold: number) => (
    <Alert severity="info">
        <AlertTitle>You are in queue or in champion select</AlertTitle>
        Everthing looks good!<br />
        Worry not, any game will be <strong>accepted after {acceptTimeThreshold} {(Math.round(acceptTimeThreshold) === 1) ? "second" : "seconds"}</strong> since found.
        You will have some time to <strong>decline</strong>!
    </Alert>
);

const gameFoundMessage = (timeToAccept: number, lockfileContent: any) => (
    <Alert severity="success">
        <AlertTitle>Game found!</AlertTitle>
        Game has been found, it will be accepted in <strong>{timeToAccept} {(Math.round(timeToAccept) === 1) ? "second" : "seconds"}</strong>!
        If you don't wish to play right now <strong>decline</strong> ASAP!
        <br />
        <br />
        <Button onClick={() => declineQueue(lockfileContent)} variant="contained" color="error">DECLINE</Button>
    </Alert>
);

const gameAcceptedMessage = (lockfileContent: any) => (
    <Alert severity="success">
        <AlertTitle>Game accepted</AlertTitle>
        Game has been <strong>accepted</strong>, have fun!
        <br />
        <br />
        <Button onClick={() => declineQueue(lockfileContent)} variant="contained" color="error">FORCE DECLINE ANYWAY</Button>
    </Alert>
);

const gameDeclinedMessage = (lockfileContent: any) => (
    <Alert severity="error">
        <AlertTitle>Game declined</AlertTitle>
        Game has been <strong>declined</strong>, see you later!
        <br />
        <br />
        <Button onClick={() => acceptQueue(lockfileContent)} variant="contained" color="success">FORCE ACCEPT ANYWAY</Button>
    </Alert>
);

const unknownStateMessage = (
    <Alert severity="info">
        <AlertTitle>State is unknown</AlertTitle>
        Can't tell what is happening.<br />
        Smart Accept is likely <strong>disabled</strong>.<br />
        If Smart Accept is <strong>enabled</strong> and problem persists please <strong>restart</strong> your League client.
    </Alert>
);

export { noInQueueMessage, inQueueMessage, gameFoundMessage, gameAcceptedMessage, gameDeclinedMessage, unknownStateMessage };