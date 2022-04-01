import React, { useContext } from 'react';
import { FormControlLabel, Slider, Stack, Switch, Typography } from '@mui/material';
import { SettingsActionType, SettingsContext } from './SettingsProvider';

export const QuickSettings: React.FC = () => {
    const { settings, settingsDispatch } = useContext(SettingsContext);

    return (
        <Stack spacing={2}>
            <Typography>Quick settings</Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={settings.autoAccept}
                        onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoAccept, payload: event.target.checked })}
                    />
                }
                label={<Typography>Accept games automatically</Typography>}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={settings.autoBan}
                        onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoBan, payload: event.target.checked })}
                    />
                }
                label={<Typography>Hover bans automatically</Typography>}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={settings.autoPick}
                        onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoPick, payload: event.target.checked })}
                    />
                }
                label={<Typography>Hover best picks automatically</Typography>}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={settings.autoLockin}
                        onChange={(event) => settingsDispatch({ type: SettingsActionType.SetAutoLockin, payload: event.target.checked })}
                    />
                }
                label={<Typography>Lock-in when timer runs out</Typography>}
            />

            <Stack>
                <Typography gutterBottom>
                    Champion avatar size
                </Typography>
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

        </Stack>
    );
}

