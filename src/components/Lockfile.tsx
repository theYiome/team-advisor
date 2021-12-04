import React, { ReactElement, FC, useState, useContext } from 'react';
import * as pathModule from 'path';

import * as clientLockfile from '../jsutils/clientLockfile.js';
import Container from '@mui/material/Container'
import { Button, TextField, Typography } from '@mui/material';
import { LockfileContext } from './LockfileContext';

export const Lockfile: FC<any> = (): ReactElement => {

    const [dirPath, setDirPath] = useState("C:\\Riot Games\\League of Legends\\");
    const [filename, setFilename] = useState("lockfile");

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const {protocol, port, username, password} = lockfileContent;


    const getLockfileData = async () => {
        const lockfilePath = pathModule.join(dirPath, filename);
        const fileData = await clientLockfile.getDataFromFile(lockfilePath);
        const parsedData = clientLockfile.parseLockfile(fileData);
        setLockfileContent(parsedData);
    }

    return (
        <Container>
            <Container>
                <TextField
                    label="protocol"
                    value={protocol}
                    sx={{width: 1, mb: 2}}
                    disabled
                />
                <TextField
                    label="port"
                    value={port}
                    sx={{width: 1, mb: 2}}
                    disabled
                />
                <TextField
                    label="username"
                    value={username}
                    sx={{width: 1, mb: 2}}
                    disabled
                />
                <TextField
                    label="password"
                    value={password}
                    sx={{width: 1, mb: 2}}
                    disabled
                />
            </Container>
            <Container>
                <TextField
                    label="dirPath"
                    value={dirPath} 
                    onChange={(e) => setDirPath(e.target.value)}
                    sx={{width: 1, mb: 2}}
                />
                <TextField
                    label="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    sx={{width: 1, mb: 2}}
                />
                <Button sx={{width: 1}} variant='contained' onClick={getLockfileData}>
                    Get data from lockfile
                </Button>
            </Container>
        </Container>
    );
}