import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel } from '@mui/material';
import { LockfileContext } from '../LockfileContext';
import * as files from '../../libs/files';

import { noClientMessage, errorStateMessage } from '../common/CommonMessages';

import { configFilePath } from '../TeamAdvisor';
import { QueuePhase, getQueueState, acceptQueue } from './SmartAcceptLogic';
import { unknownStateMessage, noInQueueMessage, inQueueMessage, gameFoundMessage, gameDeclinedMessage, gameAcceptedMessage } from './SmartAcceptMessages';
import QRCode from "react-qr-code";

const filePath = configFilePath("smartaccept.settings.json");

export const SmartAccept: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [enabled, setEnabled] = useState(true);

    const slowUpdateInterval = 2000;
    const fastUpdateInterval = 300;
    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(slowUpdateInterval);

    const initialQueueState = QueuePhase.Unknown;
    const initialQueueTimer = 0;

    const [queuePhase, setQueuePhase] = useState(initialQueueState);
    const [queueTimer, setQueueTimer] = useState(initialQueueTimer);

    const [secondsToAccept, setSecondsToAccept] = useState(0);
    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);

    // load setting from file
    useEffect(() => {
        files.loadJSON(filePath).then((settings) => {
            setEnabled(settings.enabled);
            setSecondsToAccept(settings.secondsToAccept);
            setSettingsLoaded(true);
        }).catch(error => {
            console.warn(error);
            setSettingsLoaded(true);
        });
    }, [])

    // save settings to file when settings are updated
    useEffect(() => {
        const dataToSave = {
            enabled: enabled,
            secondsToAccept: secondsToAccept
        }

        if (settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);

    }, [enabled, secondsToAccept])


    const updateFunction = () => {
        if (lockfileContent.port === "") {
            if(queuePhase !== QueuePhase.NoClient) {
                setQueuePhase(QueuePhase.NoClient);
                setQueueTimer(initialQueueTimer);
            }
            return;
        }

        getQueueState(lockfileContent).then((state) => {
            if(queuePhase !== state.state)
                setQueuePhase(state.state);
            
            if(queueTimer !== state.timer)
                setQueueTimer(state.timer);

            if (state.state === QueuePhase.GameFound && state.timer >= secondsToAccept)
                acceptQueue(lockfileContent);
        });
    }

    useEffect(() => {
        if([QueuePhase.InQueue, QueuePhase.GameFound].includes(queuePhase)) {
            if(updateInterval !== fastUpdateInterval)
                setUpdateInterval(fastUpdateInterval);
        }
        else if (updateInterval !== slowUpdateInterval)
                setUpdateInterval(slowUpdateInterval)
    }, [queuePhase]);

    // pooling client status
    useEffect(() => {
        updateFunction();

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, updateInterval));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent, settingsLoaded, updateInterval]);

    // clearing state when turned off
    useEffect(() => {
        if (!enabled) {
            setQueuePhase(initialQueueState);
            setQueueTimer(initialQueueTimer);
        }
    }, [enabled]);


    const handleTimeChange = (event: Event, newValue: number, activeThumb: number) => setSecondsToAccept(newValue);

    let currentMessage = unknownStateMessage;

    switch (queuePhase) {
        case QueuePhase.NoClient: {
            currentMessage = noClientMessage;
            break;
        }
        case QueuePhase.NoInQueue: {
            currentMessage = noInQueueMessage;
            break;
        }
        case QueuePhase.InQueue: {
            currentMessage = inQueueMessage(secondsToAccept);
            break;
        }
        case QueuePhase.GameFound: {
            currentMessage = gameFoundMessage(secondsToAccept - queueTimer, lockfileContent);
            break;
        }
        case QueuePhase.Declined: {
            currentMessage = gameDeclinedMessage(lockfileContent);
            break;
        }
        case QueuePhase.Accepted: {
            currentMessage = gameAcceptedMessage(lockfileContent);
            break;
        }
        case QueuePhase.Error: {
            currentMessage = errorStateMessage("Don't know what happened but it's not good! Maybe client isn't running?");
            break;
        }
    }

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnabled(event.target.checked);
    };

    return (
        <Container>
            <Stack spacing={2}>
                <Stack>
                    <FormControlLabel
                        control={<Switch checked={enabled} onChange={handleSwitchChange} />}
                        label={<Typography>Smart Accept</Typography>}
                    />
                </Stack>
                <Stack>
                    {currentMessage}
                </Stack>
                <Stack>
                    <Alert severity="info">
                        <AlertTitle>When my game will be accepted?</AlertTitle>
                        After <strong> {secondsToAccept} {(Math.round(secondsToAccept) === 1) ? "second" : "seconds"}</strong> since found, timing can adjust that with slider below.
                        Keep in mind that 12 second mark is last moment and there sometimes might be a miss, threfore <strong>11 seconds are recommended</strong>.
                    </Alert>
                </Stack>
                <Stack>
                    <Slider onChange={handleTimeChange} value={secondsToAccept} valueLabelDisplay="auto" step={1} marks min={0} max={12} />
                </Stack>

                <Stack>
                    {/* <QRCode value="http://facebook.github.io/react/"/> */}
                </Stack>
            </Stack>
        </Container>
    );
}