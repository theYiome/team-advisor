import React, { useState, useEffect, useContext } from 'react';
import { FormControlLabel, Stack, Container, Switch, Typography, Alert, Slider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Box, Divider } from '@mui/material';

import { ChampionsContext } from '../ChampionProvider';
import { SettingsActionType, SettingsContext } from './SettingsProvider';
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

    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant='h6'>General settings</Typography>

                <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                        value={settings.theme}
                        label="Theme"
                        onChange={(event: SelectChangeEvent) => settingsDispatch({ type: SettingsActionType.SetTheme, payload: event.target.value as string })}
                    >
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="light">Light</MenuItem>
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={<Switch checked={autoLauncherEnabled} onChange={onAutoLauncherChange} />}
                    label={<Typography>Launch on system startup</Typography>}
                    disabled={autoLauncher ? false : true}
                />

                <Divider/>


                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoAccept}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoAccept, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Auto accept</Typography>}
                />

                <Stack>
                    <Alert severity="info">
                        Game will be accepted <strong> {gameAcceptTimer} {(Math.round(gameAcceptTimer) === 1) ? "second" : "seconds"}</strong> after finding it - exact timing can adjust that with slider below.
                    </Alert>
                </Stack>
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

                <Divider/>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoBan}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoBan, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Auto ban</Typography>}
                />
                <Alert severity="info">
                    When banning phase starts,
                    app will hover first champion from your list that is not <strong>already banned</strong> and
                    is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally.

                    <ul>
                        <li>App will adjust this hover in real time.</li>
                        <li>If no champion from your ban list matches criteria, nothing will be hovered.</li>
                        <li>Hovering something by yourself takes control from the app.</li>
                    </ul>
                </Alert>

                <Divider/>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoPick}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoPick, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Auto pick</Typography>}
                />

                <Alert severity="info">
                    When your picking phase starts,
                    app will hover first champion that <strong>you own</strong> from list for your <strong>current role</strong> that is not <strong>already banned</strong> and
                    is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally and <strong>you own</strong>.
                    It will also <strong>lock in</strong> any champion you hover when timer reaches zero.

                    <ul>
                        <li>App will adjust this hover if somebody picks your champion</li>
                        <li>If no champion from your list matches criteria, nothing will be hovered.</li>
                        <li>Auto lock in does not work in custom games.</li>
                    </ul>
                </Alert>

                <Divider/>

                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.autoLockin}
                            onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoLockin, payload: event.target.checked })}
                        />
                    }
                    label={<Typography>Auto lock-in</Typography>}
                />

                <Alert severity="info">
                    When it is your turn to pick and timer runs out app will lock-in champion you are currently hovering.
                    You can adjust timer to lock-in earlier or later if you are having issues - otherwise it is strongly discouraged.
                </Alert>

                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2">Better leave as is - recommended value is 31 seconds</Typography>
                    <Slider
                        sx={{ width: "90%", ml: "5%" }}
                        value={settings.championLockinTimer}
                        onChange={onLockinAtChange}
                        marks={[{ value: 0, label: "Instant lockin" }, { value: 32, label: "To late" }]}
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

