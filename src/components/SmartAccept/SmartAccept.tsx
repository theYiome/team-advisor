import React, { ReactElement, useContext, useState } from 'react';

import Container from '@mui/material/Container'
import { Stack, Slider, Alert, AlertTitle } from '@mui/material';

import { configFilePath } from '../TeamAdvisor';
import QRCode from "react-qr-code";
import { SettingsContext } from '../Settings/SettingsProvider';

const filePath = configFilePath("smartaccept.settings.json");

export const SmartAccept: React.FC = (): ReactElement => {

    const [secondsToAccept, setSecondsToAccept] = useState(0);

    const {settingsState} = useContext(SettingsContext);


    const handleTimeChange = (event: Event, newValue: number, activeThumb: number) => setSecondsToAccept(newValue);

    return (
        <Container>
            <Stack spacing={2}>
                <Stack>
                    <Alert severity="info">
                        <AlertTitle>When my game will be accepted?</AlertTitle>
                        After <strong> {settingsState.gameAcceptTimer} 
                        {(Math.round(settingsState.gameAcceptTimer) === 1) ? "second" : "seconds"}</strong> 
                        since found, timing can adjust that with slider below.
                    </Alert>
                </Stack>
                <Stack>
                    <Slider onChange={handleTimeChange} value={settingsState.gameAcceptTimer} valueLabelDisplay="auto" step={1} marks min={0} max={12} />
                </Stack>
            </Stack>
        </Container>
    );
}