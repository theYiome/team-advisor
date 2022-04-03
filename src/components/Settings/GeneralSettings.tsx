import React, { useState, useEffect, useContext } from 'react';
import { FormControlLabel, Stack, Container, Switch, Typography, Alert, Slider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Box, Divider, Chip } from '@mui/material';

import { SettingsActionType, SettingsContext } from './SettingsProvider';
import { themesMap } from '../Themes';
let autoLauncher: any = null;

try {
    const AutoLaunch = require('auto-launch');
    autoLauncher = new AutoLaunch({
        name: "Team Advisor",
        isHidden: true
    });
} catch (error) {
    console.warn("Initializing AutoLaunch failed!", error);
}

export const GeneralSettings: React.FC = () => {
    const [autoLauncherEnabled, setAutoLauncherEnabled] = useState(false);

    const { settings, settingsDispatch } = useContext(SettingsContext);

    const [gameAcceptTimer, setGameAcceptTimer] = useState(0);

    useEffect(() => {
        if (autoLauncher)
            autoLauncher.isEnabled().then((isEnabled: boolean) => setAutoLauncherEnabled(isEnabled));
    }, []);

    useEffect(() => {
        setGameAcceptTimer(settings.gameAcceptTimer);
    }, [settings.gameAcceptTimer])


    const handleTimerChange = (event: Event, newValue: number, activeThumb: number) => {
        if (newValue !== gameAcceptTimer)
            setGameAcceptTimer(newValue);
    }

    const onLockinAtChange = (event: Event, newValue: number, activeThumb: number) => {
        if (newValue !== settings.championLockinTimer)
            settingsDispatch({ type: SettingsActionType.SetChampionLockinTimer, payload: newValue });
    }

    const commitTimerChange = (event: React.SyntheticEvent | Event, newValue: number) => {
        settingsDispatch({ type: SettingsActionType.SetGameAcceptTimer, payload: newValue });
    }

    const onAutoLauncherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;

        if (autoLauncher) {
            autoLauncher.isEnabled().then(
                (isEnabled: boolean) => {
                    if (isEnabled && !isChecked)
                        autoLauncher.disable().then(setAutoLauncherEnabled(isChecked));
                    else if (!isEnabled && isChecked)
                        autoLauncher.enable().then(setAutoLauncherEnabled(isChecked));
                }
            );
        }
    }

    const gameAcceptTimerMessage = gameAcceptTimer === 0 ? "instantly" : (gameAcceptTimer === 1 ? "after 1 second" : `after ${gameAcceptTimer} seconds`);


    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant='h6'>General settings</Typography>

                <Divider>
                    <Chip label="Themes"/>
                </Divider>

                <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                        value={settings.theme}
                        label="Theme"
                        onChange={(event: SelectChangeEvent) => settingsDispatch({ type: SettingsActionType.SetTheme, payload: event.target.value as string })}
                    >
                        { Object.keys(themesMap).map(key => <MenuItem key={key} value={key}>{key}</MenuItem>)}
                    </Select>
                </FormControl>

                <Divider>
                    <Chip label="Auto launch"/>
                </Divider>

                <Typography>
                    Automatically launch Team Advisor on PC startup. It will stay hidden in the system tray.
                </Typography>

                <FormControlLabel
                    control={<Switch checked={autoLauncherEnabled} onChange={onAutoLauncherChange} />}
                    label={<Typography>Launch on system startup</Typography>}
                    disabled={autoLauncher ? false : true}
                />
                
                <Divider>
                    <Chip label="Avatar size"/>
                </Divider>

                <Typography>
                    Set champion avatar size used in displaying pick recommendations.
                    Value of <strong>68px</strong> is the default avatar size in League Client.
                </Typography>

                <Stack>
                    <Slider
                        onChange={(event: Event, newValue: number, activeThumb: number) => settingsDispatch({ type: SettingsActionType.SetChampionAvatarSize, payload: newValue })}
                        value={settings.championAvatarSize}
                        valueLabelDisplay="auto"
                        step={2}
                        marks
                        min={36}
                        max={88}
                        sx={{ width: "90%", ml: "5%" }}
                    />
                </Stack>

                <Divider>
                    <Chip label="Auto accept"/>
                </Divider>

                <Typography>
                    If enabled and new game is found, 
                    said game will be accepted <strong>{gameAcceptTimerMessage}</strong>.
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoAccept}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoAccept, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Enable auto accept</Typography>}
                />

                <Typography>
                    Accept timing can adjust that with slider below. Lower values are recommended because they decrease probability of sound glitches in League Client.
                </Typography>

                <Stack>
                    <Slider
                        onChange={handleTimerChange}
                        onChangeCommitted={commitTimerChange}
                        value={gameAcceptTimer}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={0}
                        max={12}
                        sx={{ width: "90%", ml: "5%" }}
                    />
                </Stack>

                <Divider>
                    <Chip label="Auto ban"/>
                </Divider>

                <Typography>
                    In banning phase app will hover first champion from your ban list that is not a pick intent of any ally. 
                    App will adjust this hover if somebody eliminates your ban before you. 
                    If no champion from your ban list matches criteria, nothing will be hovered.
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoBan}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoBan, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Enable auto ban</Typography>}
                />

                <Divider>
                    <Chip label="Auto pick"/>
                </Divider>

                <Typography>
                    In picking phase app will hover first champion for your current role from predictions list that 
                    is not already banned and is not a pick intent of any ally. App will adjust this hover if somebody picks your champion. 
                    If no champion from your list matches criteria, nothing will be hovered.
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoPick}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoPick, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Enable auto pick</Typography>}
                />

                <Divider>
                    <Chip label="Auto lock-in"/>
                </Divider>

                <Typography>
                    If in your picking phase timer runs out app will lock-in champion you are currently hovering. 
                    Auto lock-in works only in draft games, doesn't work in customs.
                </Typography>
                
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoLockin}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoLockin, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Enable auto lock-in</Typography>}
                />

                <Typography>
                    You can adjust timer to lock-in earlier or later if you are having issues - otherwise it is strongly discouraged.
                </Typography>

                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2">Better leave as is - recommended value is 31 seconds</Typography>
                    <Slider
                        sx={{ width: "90%", ml: "5%" }}
                        value={settings.championLockinTimer}
                        onChange={onLockinAtChange}
                        marks={[{ value: 0, label: "Instant lock-in" }, { value: 32, label: "To late" }]}
                        min={0}
                        max={40}
                        step={0.5}
                        valueLabelDisplay="auto"
                    />
                </Box>
            </Stack>
        </Container>
    );
}

