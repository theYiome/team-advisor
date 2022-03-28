import React, { ReactElement, useContext } from 'react';

import Container from '@mui/material/Container'
import { Button, Typography, Alert, AlertTitle, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ButtonGroup, TextField } from '@mui/material';
import { LcuContext, LcuCredentials } from './LcuProvider';
import { rawLcuRequest } from '../../libs/lcuRequest';
import { SettingsActionType, SettingsContext } from '../Settings/SettingsProvider';

export const ClientAccess: React.FC = (): ReactElement => {

    const lcuState = useContext(LcuContext);
    const { settings, settingsDispatch } = useContext(SettingsContext);
    const { protocol, port, username, password } = lcuState.credentials;

    const warning_msg = (
        <Alert severity="warning">
            <AlertTitle>Failed to load data from lockfile</AlertTitle>
            Either <strong>client is not running</strong> or <strong>given installation path is incorrect</strong>.
            Remember to choose your League instalation directory!
        </Alert>
    );

    const ok_message = (
        <Alert severity="success">
            <AlertTitle>Loaded data from lockfile</AlertTitle>
            Successulfy loaded data from lockfile.<br /><strong>Looks OK!</strong>
        </Alert>
    );

    const data_table = (
        <Paper sx={{ p: 1 }}>
            <TableContainer>
                <Table sx={{ width: 1 }} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>names</TableCell>
                            <TableCell>values</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key={1} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">protocol</TableCell>
                            <TableCell component="th" scope="row">{protocol}</TableCell>
                        </TableRow>
                        <TableRow key={2} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">port</TableCell>
                            <TableCell component="th" scope="row">{port}</TableCell>
                        </TableRow>
                        <TableRow key={3} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">username</TableCell>
                            <TableCell component="th" scope="row">{username}</TableCell>
                        </TableRow>
                        <TableRow key={4} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">password</TableCell>
                            <TableCell component="th" scope="row">{password}</TableCell>
                        </TableRow>
                        <TableRow key={5} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">displayName</TableCell>
                            <TableCell component="th" scope="row">{lcuState.summoner.displayName}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    return (
        <Container>
            <Stack spacing={3}>
                {!lcuState.valid ? warning_msg : ok_message}

                {data_table}

                <TextField
                    label="League installation directory"
                    value={settings.leagueInstallationPath}
                    onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) =>
                            settingsDispatch({ type: SettingsActionType.SetLeagueInstallationPath, payload: event.target.value })
                    }
                />

                <Paper elevation={1} sx={{ p: 1, pb: 2 }}>
                    <Container>
                        <Typography variant='h6'>
                            Utilities
                        </Typography>
                        <Typography>
                            Sometimes client may bug while using this app (annoying sounds or visual glitches).
                            If that happens you can <strong>restart client UX</strong>, that is a visual part of the client.
                            It will take around 10 seconds and <strong>it will not kick you out</strong> of lobby, game search or champion select.
                            Features like <strong>Smart Accept</strong> or <strong>Smart Ban</strong> will still work when client UX is offline.
                        </Typography>
                    </Container>
                </Paper>
                <ButtonGroup sx={{ width: 1 }} variant="contained" aria-label="outlined primary button group">
                    <Button sx={{ width: 1 }} color="error" onClick={() => restartClientUX(lcuState.credentials)}>RESTART CLIENT UX</Button>
                </ButtonGroup>
            </Stack>
        </Container>
    );
}

function restartClientUX(lockfileContent: LcuCredentials): void {
    const endpointName = "riotclient/kill-and-restart-ux";
    rawLcuRequest(lockfileContent, endpointName, { method: 'POST' }).catch(error => console.warn(error));
}