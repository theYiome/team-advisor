import React, { ReactElement, useContext } from 'react';

import Container from '@mui/material/Container'
import { Typography, Alert, AlertTitle, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { LcuContext } from './LcuProvider';
import { SettingsActionType, SettingsContext } from '../Settings/SettingsProvider';

export const ClientAccess: React.FC = (): ReactElement => {

    const lcuState = useContext(LcuContext);
    const { settings, settingsDispatch } = useContext(SettingsContext);
    const { protocol, port, username, password } = lcuState.credentials;

    const warning_msg = (
        <Alert severity="warning" variant='outlined'>
            Failed to detect League Client! Either <strong>client is not running</strong> or <strong>given installation path is incorrect</strong>.
            Remember to fill in your League instalation directory!
        </Alert>
    );

    const ok_message = (
        <Alert severity="success" variant='outlined'>
            League Client detected! Successulfy loaded data from lockfile. <strong>All good!</strong>
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
                <Typography variant='h6'>Connection with League Client</Typography>

                {!lcuState.valid ? warning_msg : ok_message}

                <TextField
                    label="League installation directory"
                    value={settings.leagueInstallationPath}
                    onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) =>
                            settingsDispatch({ type: SettingsActionType.SetLeagueInstallationPath, payload: event.target.value })
                    }
                />

                {data_table}
            </Stack>
        </Container>
    );
}