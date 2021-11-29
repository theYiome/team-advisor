import * as React from 'react';
import * as pathModule from 'path';

import * as clientLockfile from '../jsutils/clientLockfile.js';
import Container from '@mui/material/Container'
import { Button, TextField, Typography } from '@mui/material';


export class Lockfile extends React.Component {
    state: any = {
        dirPath: "C:\\Riot Games\\League of Legends\\",
        filename: "lockfile",
        username: "riot",
        protocol: "https",
        port: null,
        password: null
    }

    lockfilePath() {
        return pathModule.join(this.state.dirPath, this.state.filename);
    }

    onPathChange(event: any) {
        this.setState({path: event.target.value});
    }

    async getLockfileData() {
        const fileData = await clientLockfile.getDataFromFile(this.lockfilePath());
        const parsedData = clientLockfile.parseLockfile(fileData);
        this.setState(parsedData);
    }

    render() {
        return (
            <Container>
                <Container>
                    <Typography>{this.state.protocol}</Typography>
                    <Typography>{this.state.port}</Typography>
                    <Typography>{this.state.username}</Typography>
                    <Typography>{this.state.password}</Typography>
                </Container>
                <Container>
                    <TextField 
                        value={this.state.dirPath} 
                        onChange={(e) => this.onPathChange(e)}
                    />
                    <Typography>{this.state.filename}</Typography>
                </Container>
                <Container>
                    <Button variant='contained' onClick={() => this.getLockfileData()}>
                        Get data from lockfile
                    </Button>
                </Container>
            </Container>
        )
    } 
}