import React, { ReactElement, useState } from 'react';

import Container from '@mui/material/Container'
import { Stack, Slider, Alert, AlertTitle } from '@mui/material';

import { configFilePath } from '../TeamAdvisor';
import QRCode from "react-qr-code";

const filePath = configFilePath("smartaccept.settings.json");

export const SmartAccept: React.FC = (): ReactElement => {

    const [secondsToAccept, setSecondsToAccept] = useState(0);
    // const lcuState = useContext(LcuContext);

    // const updateFunction = () => {
    //     if (!lcuState.valid) {
    //         if(queuePhase !== QueuePhase.NoClient) {
    //             setQueuePhase(QueuePhase.NoClient);
    //             setQueueTimer(initialQueueTimer);
    //         }
    //         return;
    //     }

    //     getQueueState(lcuState.credentials).then((state: { state: any; timer: React.SetStateAction<number>; }) => {
    //         if(queuePhase !== state.state)
    //             setQueuePhase(state.state);
            
    //         if(queueTimer !== state.timer)
    //             setQueueTimer(state.timer);

    //         if (state.state === QueuePhase.GameFound && state.timer >= secondsToAccept)
    //             acceptQueue(lcuState.credentials);
    //     });
    // }


    const handleTimeChange = (event: Event, newValue: number, activeThumb: number) => setSecondsToAccept(newValue);

    return (
        <Container>
            <Stack spacing={2}>
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
            </Stack>
        </Container>
    );
}