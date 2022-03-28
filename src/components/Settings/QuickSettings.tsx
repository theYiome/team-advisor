import React, { useContext } from 'react';
import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { SettingsActionType, SettingsContext } from './SettingsProvider';

export const QuickSettings: React.FC = () => {
    const { settings, settingsDispatch } = useContext(SettingsContext);

    return (
        <Stack spacing={3}>
            <Typography variant='h6'>Quick settings</Typography>

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
        </Stack>
    );
}

