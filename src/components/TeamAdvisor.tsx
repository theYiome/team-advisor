import React, { ReactElement, FC, useState, useContext } from 'react';

import { ClientAccess } from './ClientAccess';
import { Lobby } from './Lobby';
import { SmartAccept } from './SmartAccept';
import { SmartBan } from './SmartBan';
import { Settings } from './Settings';
import { TeamBuilder } from './TeamBuilder';

import { LockfileProvider } from './LockfileContext';
import { ChampionsProvider } from './ChampionsContext';

import { Accordion, AccordionDetails, AccordionSummary, Button, Paper, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '@fontsource/roboto/400.css';


export const TeamAdvisor: FC<any> = (): ReactElement => {
    const headerStyle = {backgroundImage: "linear-gradient(to right, #FFF, #DDD, #EEE)"};
    const headerStyle2 = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #CCC)"};
    return (
        <LockfileProvider>
            <ChampionsProvider>
                <Stack sx={{boxShadow: 8, p: 8}} spacing={1}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={headerStyle2} component={Paper}>
                            <Typography>
                                Settings
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Settings></Settings>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={headerStyle2} component={Paper}>
                            <Typography>
                                League Client
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ClientAccess></ClientAccess>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={headerStyle} component={Paper}>
                            <Typography>
                                Smart Accept
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <SmartAccept></SmartAccept>
                        </AccordionDetails>
                    </Accordion>
                    
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={headerStyle} component={Paper}>
                            <Typography>
                                Smart Ban
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <SmartBan></SmartBan>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={headerStyle} component={Paper}>
                            <Typography>
                                Lobby State
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Lobby></Lobby>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>} sx={headerStyle2} component={Paper}>
                            <Typography>
                                Team Builder
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TeamBuilder></TeamBuilder>
                        </AccordionDetails>
                    </Accordion>

                </Stack>
            </ChampionsProvider>
        </LockfileProvider>
    );
}