import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete } from '@mui/material';

import * as files from '../libs/files';
import * as connections from '../libs/connections'

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './CommonMessages';

/*
    GET /lol-matchmaking/v1/ready-check	
    POST /lol-matchmaking/v1/ready-check/accept	
    POST /lol-matchmaking/v1/ready-check/decline
*/

const filePath = "settings/smartban.settings.json";

enum BanStateEnum {
    NoClient,
    NoInLobby,
    InLobby,
    Banning,
    BanHovered,
    Unknown,
    Error
}

type BanState = {
    state: BanStateEnum,
    timer: number
}

export const SmartBan: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);

    const initialLobbyState = {
        state: BanStateEnum.Unknown,
        timer: 0
    };
    const [lobbyState, setLobbyState] = useState(initialLobbyState);
    const [banList, setBanList] = useState([]);
    const [secondsToAction, setSecondsToAction] = useState(8);

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const [champions, setChampions] = useContext(ChampionsContext);


    // load setting from file
    useEffect(() => {
        files.loadJSON(filePath).then((settings) => {
            setEnabled(settings.enabled);
            setSecondsToAction(settings.secondsToAction);
            setBanList(settings.banList);
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
            banList: banList,
            secondsToAction: secondsToAction
        }

        if(settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);
            
    }, [enabled, secondsToAction])

    // pooling client status
    useEffect(() => {

        const updateFunction = () => {
            // getQueueState(lockfileContent).then((state) => {
            //     setQueueState(state);

            //     if (state.state === QueueStateEnum.GameFound && state.timer >= secondsToAction)
            //         acceptQueue(lockfileContent);
            // });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, 700));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent, settingsLoaded]);

    // clearing state when turned off
    useEffect(() => {
        if(!enabled)
            setLobbyState(initialLobbyState);
    }, [enabled]);

    
    const handleTimeChange = (event: Event, newValue: number, activeThumb: number) => {
        setSecondsToAction(newValue);
    };

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

    const switchLabel = (<>Enable <strong>Smart Ban</strong></>);

    return (
        <Container>
            <Stack spacing={3}>
                <Stack>
                    <FormControlLabel control={enablingSwitch} label={switchLabel} />
                </Stack>
                <Stack>
                    <Autocomplete
                        multiple
                        options={Object.values(champions)}
                        value={banList}
                        onChange={(event, newValue) => {
                            console.log(newValue);
                            setBanList(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Ban list"
                                placeholder="champions to ban in order"
                            />
                        )}
                    />
                </Stack>
                <Stack>
                    <Alert severity="info">
                        <AlertTitle>How does it work?</AlertTitle>
                        After <strong>{secondsToAction} {secondsToAction > 1.1 ? "seconds" : "second"}</strong> since start of the banning phase,
                        there will be an attempt to ban first champion from your list that isn't <strong>already banned</strong> and 
                        isn't a <strong>pick intent</strong> of any ally and isn't currently <strong>disabled</strong> (for example due to game breaking bug).
                        If no such champion is found, nothing will happen.
                        <br/>
                        Timing can adjust that with slider below.
                    </Alert>
                </Stack>
                <Stack>
                    <Slider onChange={handleTimeChange} value={secondsToAction} valueLabelDisplay="auto" step={1} marks min={1} max={12}/>
                </Stack>
            </Stack>
        </Container>
    );
}