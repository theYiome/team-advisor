import React, { ReactElement, FC, useState, useContext } from 'react';

import { Lockfile } from './Lockfile';
import { Lobby } from './Lobby';
import { SmartAccept } from './SmartAccept';
import { SmartBan } from './SmartBan';
import { Settings } from './Settings';

import { LockfileProvider } from './LockfileContext';
import { ChampionsProvider } from './ChampionsContext';

import { Accordion, AccordionDetails, AccordionSummary, Button, Container, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const TeamAdvisor: FC<any> = (): ReactElement => {
    return (
        <LockfileProvider>
            <ChampionsProvider>
                <Container sx={{boxShadow: 8, p: 8}}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                Settings
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Settings></Settings>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                Lockfile access
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Lockfile></Lockfile>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                Smart Accept
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <SmartAccept></SmartAccept>
                        </AccordionDetails>
                    </Accordion>
                    
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                Smart Ban
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <SmartBan></SmartBan>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                Lobby State
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Lobby></Lobby>
                        </AccordionDetails>
                    </Accordion>

                </Container>
            </ChampionsProvider>
        </LockfileProvider>
    );
}