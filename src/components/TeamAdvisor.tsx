import React, { ReactElement, FC, useState, useContext } from 'react';

import { ClientAccess } from './ClientAccess';
import { Lobby } from './Lobby';
import { SmartAccept } from './SmartAccept';
import { SmartBan } from './SmartBan';
import { Settings } from './Settings';
import { TeamBuilder } from './TeamBuilder';

import { LockfileProvider } from './LockfileContext';
import { ChampionsProvider } from './ChampionsContext';

import { Accordion, AccordionDetails, AccordionSummary, Container, Paper, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '@fontsource/roboto/400.css';


export const TeamAdvisor: FC<any> = (): ReactElement => {
    const headerStyle = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #a7caed)"};
    const headerStyle2 = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #e0ebfa)"};
    const expandIcon = (<ExpandMoreIcon color="action" sx={{ color: "black" }} fontSize="large"/>);
    const accordionDetailsStyle = {mt: 2};
    const headerVariant = "h6";
    return (
        <LockfileProvider>
            <ChampionsProvider>
                <Container sx={{boxShadow: 8, pl: 8, pr: 8, pt: 4, pb: 4}}>
                    <Typography variant="h4" color="#083c9e" marginBottom={2}>
                        Team Advisor
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle2} component={Paper}>
                            <Typography variant={headerVariant}>
                                Settings
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <Settings></Settings>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle2} component={Paper}>
                            <Typography variant={headerVariant}>
                                League Client
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <ClientAccess></ClientAccess>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle} component={Paper}>
                            <Typography variant={headerVariant}>
                                Smart Accept
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <SmartAccept></SmartAccept>
                        </AccordionDetails>
                    </Accordion>
                    
                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle} component={Paper}>
                            <Typography variant={headerVariant}>
                                Smart Ban
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <SmartBan></SmartBan>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle} component={Paper}>
                            <Typography variant={headerVariant}>
                                Lobby State
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <Lobby></Lobby>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle2} component={Paper}>
                            <Typography variant={headerVariant}>
                                Team Builder
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <TeamBuilder></TeamBuilder>
                        </AccordionDetails>
                    </Accordion>

                </Container>
            </ChampionsProvider>
        </LockfileProvider>
    );
}