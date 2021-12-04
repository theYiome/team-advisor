import React, { ReactElement, FC, useState, useContext } from 'react';

import { Lockfile } from './Lockfile';
import { Lobby } from './Lobby';
import { LockfileProvider } from './LockfileContext';
import { Settings } from './Settings';

import { Accordion, AccordionDetails, AccordionSummary, Button, Container, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const TeamAdvisor: FC<any> = (): ReactElement => {
    return (
        <LockfileProvider>
            <Container sx={{boxShadow: 8, p: 10}}>
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
                            Lobby State
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Lobby></Lobby>
                    </AccordionDetails>
                </Accordion>
            </Container>
        </LockfileProvider>
    );
}