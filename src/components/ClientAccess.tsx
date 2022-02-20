import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';
import * as pathModule from 'path';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Alert, AlertTitle, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ButtonGroup } from '@mui/material';
import { LcuContext } from './LcuProvider';

import * as files from '../libs/files';
import { rawLcuRequest } from '../libs/lcuRequest';

import { configFilePath } from './TeamAdvisor';
const filePath =  configFilePath("lockfile.settings.json");

export const ClientAccess: FC<any> = (): ReactElement => {

    const defaultDirPath = "C:\\Riot Games\\League of Legends\\";
    const defaultFilename = "lockfile";

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [dirPath, setDirPath] = useState(defaultDirPath);
    const [filename, setFilename] = useState(defaultFilename);

    const [lockfileContent, setLockfileContent] = useContext(LcuContext);
    const { protocol, port, username, password } = lockfileContent;
    const emtpyLockfile = {
        protocol: "",
        port: "",
        username: "",
        password: "",
    };
    
    const getLockfileData = async () => {
        const lockfilePath = pathModule.join(dirPath, filename);
        try {
            const fileData = await files.loadString(lockfilePath);
            const parsedData = parseLockfile(fileData);
            if(!compareLockfiles(parsedData, lockfileContent))
                setLockfileContent(parsedData);
        } catch (err) {
            console.info(err);
            if(!compareLockfiles(emtpyLockfile, lockfileContent))
                setLockfileContent(emtpyLockfile);
        }
    }

    const resetToDefault = () => {
        setDirPath(defaultDirPath);
        setFilename(defaultFilename);
    };

    // load setting from file
    useEffect(() => {
        files.loadJSON(filePath).then((settings) => {
            setDirPath(settings.dirPath);
            setFilename(settings.filename);
            setSettingsLoaded(true);
        }).catch(error => {
            console.warn(error);
            setSettingsLoaded(true);
        });
    }, []);

    // save settings to file when settings are updated
    useEffect(() => {
        const dataToSave = {
            dirPath: dirPath,
            filename: filename
        }

        if(settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);
    }, [dirPath, filename]);

    // periodicly check lockfile
    useEffect(() => {
        getLockfileData();
        const periodicUpdate = setInterval(getLockfileData, 5000);
        return () => clearInterval(periodicUpdate);

    }, [dirPath, filename, settingsLoaded]);


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
            Successulfy loaded data from lockfile.<br/><strong>Looks OK!</strong>
        </Alert>
    );

    const data_table = (
        <Paper sx={{p: 1}}>
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
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    return (
        <Container>
            <Stack spacing={3}>
                {port === "" ? warning_msg : ok_message}
                {data_table}
                <TextField
                    label="League installation path"
                    value={dirPath}
                    onChange={(e) => setDirPath(e.target.value)}
                    sx={{ width: 1, mb: 2 }}
                />
                <TextField
                    label="Lockfile filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    sx={{ width: 1, mb: 2 }}
                />

                <Button sx={{ width: 1}} color="success" variant='outlined' onClick={resetToDefault}>RESET TO DEFAULT</Button>

                <Paper elevation={1} sx={{p: 1, pb: 2}}>
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
                    <Button sx={{ width: 1}} color="error" onClick={() => restartClientUX(lockfileContent)}>RESTART CLIENT UX</Button>
                </ButtonGroup>
            </Stack>
        </Container>
    );
}

function restartClientUX(lockfileContent: any): void {
    const endpointName = "riotclient/kill-and-restart-ux";
    rawLcuRequest(lockfileContent, endpointName, { method: 'POST' }).catch(error => console.warn(error));
}