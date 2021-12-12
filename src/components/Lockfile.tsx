import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';
import * as pathModule from 'path';

import Container from '@mui/material/Container'
import { Button, TextField, Typography } from '@mui/material';
import { LockfileContext } from './LockfileContext';
import * as files from '../libs/files';

export const Lockfile: FC<any> = (): ReactElement => {

    const [dirPath, setDirPath] = useState("C:\\Riot Games\\League of Legends\\");
    const [filename, setFilename] = useState("lockfile");

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const { protocol, port, username, password } = lockfileContent;
    
    const getLockfileData = async () => {
        const lockfilePath = pathModule.join(dirPath, filename);
        const fileData = await files.loadString(lockfilePath);
        const parsedData = parseLockfile(fileData);
        setLockfileContent(parsedData);
    }

    useEffect(() => {

        const updateFunction = () => {
            getLockfileData();
        }

        getLockfileData();
        const periodicUpdate = setInterval(updateFunction, 5000);

        return () => clearInterval(periodicUpdate);

    }, [dirPath, filename]);


    return (
        <Container>
            <Container>
                <TextField
                    label="protocol"
                    value={protocol}
                    sx={{ width: 1, mb: 2 }}
                    disabled
                />
                <TextField
                    label="port"
                    value={port}
                    sx={{ width: 1, mb: 2 }}
                    disabled
                />
                <TextField
                    label="username"
                    value={username}
                    sx={{ width: 1, mb: 2 }}
                    disabled
                />
                <TextField
                    label="password"
                    value={password}
                    sx={{ width: 1, mb: 2 }}
                    disabled
                />
            </Container>
            <Container>
                <TextField
                    label="dirPath"
                    value={dirPath}
                    onChange={(e) => setDirPath(e.target.value)}
                    sx={{ width: 1, mb: 2 }}
                />
                <TextField
                    label="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    sx={{ width: 1, mb: 2 }}
                />
                <Button sx={{ width: 1 }} variant='contained' onClick={getLockfileData}>
                    Get data from lockfile
                </Button>
            </Container>
        </Container>
    );
}

function parseLockfile(fileString: any) {
    const fileArray = fileString.split(":");

    console.log(fileArray);
    if (fileArray.length < 5) {
        throw `At least 5 strings required, ${fileArray.length} found.
        String is "${fileString}"`;
    }

    return {
        protocol: fileArray[4],
        port: fileArray[2],
        username: "riot",
        password: fileArray[3],
    }
}