import React, { ReactElement, FC } from 'react';

import { ClientAccess } from './ClientAccess';
import { SmartAccept } from './SmartAccept';
import { Settings } from './Settings';
import { TeamBuilder } from './TeamBuilder';

import { LockfileProvider } from './LockfileContext';
import { ChampionsProvider } from './ChampionsContext';

import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Container, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '@fontsource/roboto/400.css';
import { SmartChampionSelect } from './SmartChampionSelect';

import { trayIcon228 as icon } from '../imagesBase64';

export const TeamAdvisor: FC<any> = (): ReactElement => {
    const [tabId, setTabId] = React.useState(0);

    // const headerStyle = { backgroundImage: "linear-gradient(to right, #FFF, #FFF, #a7caed)" };
    // const headerStyle2 = { backgroundImage: "linear-gradient(to right, #FFF, #FFF, #e0ebfa)" };
    // const headerStyle3 = { backgroundImage: "linear-gradient(to right, #FFF, #FFF, #fff4e5)" };
    // const headerStyle4 = { backgroundImage: "linear-gradient(to right, #FFF, #FFF, #e6f0ff)" };
    // const expandIcon = (<ExpandMoreIcon color="action" sx={{ color: "black" }} fontSize="large" />);
    // const accordionDetailsStyle = { mt: 2 };
    // const headerVariant = "h6";

    return (

        <Container sx={{ boxShadow: 8, pl: 8, pr: 8, pt: 4, pb: 4 }}>
            <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 2 }}
                justifyContent="center"
                alignItems="center">
                <Avatar src={icon} sx={{ boxShadow: 1, width: "32px", height: "32px" }} />
                <Typography variant="h5" color="#252523" marginBottom={2}>
                    Team Advisor
                </Typography>
            </Stack>

            <Box sx={{ width: '100%' }}>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabId}
                        onChange={(event: any, nextTabId: number) => setTabId(nextTabId)}
                        aria-label="main navigation tabs"
                        variant="fullWidth">
                        <Tab label="Champion Select" {...a11yProps(0)} />
                        <Tab label="Smart Accept" {...a11yProps(1)} />
                        <Tab label="League Client" {...a11yProps(2)} />
                        <Tab label="Settings" {...a11yProps(3)} />
                        <Tab label="Team Builder" {...a11yProps(4)} />
                    </Tabs>
                </Box>

                <LockfileProvider>
                    <ChampionsProvider>

                        <TabPanel value={tabId} index={0}>
                            <SmartChampionSelect></SmartChampionSelect>
                        </TabPanel>
                        <TabPanel value={tabId} index={1}>
                            <SmartAccept></SmartAccept>
                        </TabPanel>
                        <TabPanel value={tabId} index={2}>
                            <ClientAccess></ClientAccess>
                        </TabPanel>
                        <TabPanel value={tabId} index={3}>
                            <Settings></Settings>
                        </TabPanel>
                        <TabPanel value={tabId} index={4}>
                            <TeamBuilder></TeamBuilder>
                        </TabPanel>

                    </ChampionsProvider>
                </LockfileProvider>

            </Box>

        </Container>
    );
}


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            sx={{ mt: 3 }}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {children}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
