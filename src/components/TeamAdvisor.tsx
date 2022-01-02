import React, { ReactElement, FC } from 'react';

import { ClientAccess } from './ClientAccess';
import { Lobby } from './Lobby';
import { SmartAccept } from './SmartAccept';
import { SmartBan } from './SmartBan';
import { Settings } from './Settings';
import { TeamBuilder } from './TeamBuilder';

import { LockfileProvider } from './LockfileContext';
import { ChampionsProvider } from './ChampionsContext';

import { Accordion, AccordionDetails, AccordionSummary, Avatar, Container, Paper, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '@fontsource/roboto/400.css';
import { SmartPick } from './SmartPick';


import { trayIcon228 as icon } from '../imagesBase64';

export const TeamAdvisor: FC<any> = (): ReactElement => {
    const headerStyle = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #a7caed)"};
    const headerStyle2 = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #e0ebfa)"};
    const headerStyle3 = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #fff4e5)"};
    const headerStyle4 = {backgroundImage: "linear-gradient(to right, #FFF, #FFF, #e6f0ff)"};
    const expandIcon = (<ExpandMoreIcon color="action" sx={{ color: "black" }} fontSize="large"/>);
    const accordionDetailsStyle = {mt: 2};
    const headerVariant = "h6";
    return (
        <LockfileProvider>
            <ChampionsProvider>
                <Container sx={{boxShadow: 8, pl: 8, pr: 8, pt: 4, pb: 4}}>

                    <Stack direction="row" spacing={2} sx={{mb: 2}}>
                        <Avatar src={icon}/>
                        <Typography variant="h4" color="#083c9e" marginBottom={2}>
                            Team Advisor
                        </Typography>
                    </Stack>

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
                                Smart Pick
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={accordionDetailsStyle}>
                            <SmartPick></SmartPick>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={expandIcon} sx={headerStyle3} component={Paper}>
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