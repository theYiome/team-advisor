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
        port: "",
        password: ""
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
                    <TextField
                        label="protocol"
                        value={this.state.protocol}
                        sx={{width: 1, mb: 2}}
                    />
                    <TextField
                        label="port"
                        value={this.state.port}
                        sx={{width: 1, mb: 2}}
                    />
                    <TextField
                        label="username"
                        value={this.state.username}
                        sx={{width: 1, mb: 2}}
                    />
                    <TextField
                        label="password"
                        value={this.state.password}
                        sx={{width: 1, mb: 2}}
                    />
                </Container>
                <Container>
                    <TextField
                        label="dirPath"
                        value={this.state.dirPath} 
                        onChange={(e) => this.onPathChange(e)}
                        sx={{width: 1, mb: 2}}
                    />
                    <TextField
                        label="filename"
                        value={this.state.filename}
                        sx={{width: 1, mb: 2}}
                    />
                    <Button sx={{width: 1}} variant='contained' onClick={() => this.getLockfileData()}>
                        Get data from lockfile
                    </Button>
                </Container>
            </Container>
        )
    } 
}