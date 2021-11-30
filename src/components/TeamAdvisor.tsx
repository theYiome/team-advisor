import * as React from 'react';

import { Lockfile } from './Lockfile';
import { Lobby } from './Lobby';
import { Team } from './Team';

import * as settingsModule from '../jsutils/settings.js';
import * as ddragon from '../jsutils/ddragon.js';
import * as clientLockfile from '../jsutils/clientLockfile.js';
import { Accordion, AccordionDetails, AccordionSummary, Button, Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export class TeamAdvisor extends React.Component {
    constructor(props: any) {
        super(props);
        this.state.lockfileRef = React.createRef();
        this.state.lobbyRef = React.createRef();
    }
    
    state: any = {
        version: "0.01",
        lockfileRef: null
    }

    async updateLobby() {
        const lockfileState = this.state.lockfileRef.current.state;

        // const lobbyState = await parsedLobbyState(lockfileState.port, lockfileState.password);
        const lobbyState = await clientLockfile.mockedParsedLobbyState();

        this.state.lobbyRef.current.update(lobbyState);
    }

    async updateStaticChampionData() {
        const versionsArray: any = await ddragon.ddragonVersions();

        // const settings = await settingsModule.loadSetting();
        // settingsModule.saveSettings(settings);
        try {
            const localChampionData = await settingsModule.loadJSON("data/champion.json")
            if(localChampionData.patch != versionsArray[0]) {
                console.log(`You should update assets to new patch: ${localChampionData.patch} != ${versionsArray[0]}`);
                const champions = await ddragon.ddragonChampions(versionsArray[0]);
                settingsModule.saveJSON(champions, "data/champion.json", 4)
            }
            console.log(`Already latest patch: ${localChampionData.patch} === ${versionsArray[0]}`);
        } catch(err) {
            console.warn(err);
            const champions = await ddragon.ddragonChampions(versionsArray[0]);
            settingsModule.saveJSON(champions, "data/champion.json", 4)
        }

    }

    async updateSettings() {
    }

    render() {
        return (
            <Container sx={{boxShadow: 10, p: 10}}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>
                            Lockfile access
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Lockfile ref={this.state.lockfileRef}></Lockfile>
                    </AccordionDetails>
                </Accordion>
                
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>
                            Buttons
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Button variant="contained" onClick={() => this.updateLobby()}>Update lobby data</Button>
                        <Button variant="contained" onClick={() => this.updateStaticChampionData()}>Update static champion data</Button>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>
                            Lobby State
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Lobby ref={this.state.lobbyRef}></Lobby>
                    </AccordionDetails>
                </Accordion>
            </Container>
        )
    } 
}