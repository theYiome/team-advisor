import { app, getCurrentWindow } from '@electron/remote';
import * as path from 'path';

export const userData = app.getPath("userData");
export const configFilePath = (filename: string) => path.join(userData, filename);

console.log({ userData, configFilePath });

import React, { ReactElement, FC } from 'react';

import { ClientAccess } from './ClientAccess';
import { SmartAccept } from './SmartAccept/SmartAccept';
import { Settings } from './Settings';

import { LockfileProvider } from './LockfileContext';
import { ChampionsProvider } from './ChampionsContext';

import { Box, Container, Tab, Tabs, Paper } from '@mui/material';

import '@fontsource/roboto/400.css';
import { SmartChampionSelect } from './SmartChampionSelect/SmartChampionSelect';

export const TeamAdvisor: FC<any> = (): ReactElement => {
    const [tabId, setTabId] = React.useState(0);

    return (
        <Paper elevation={1} sx={{ pl: 4, pr: 4, pt: 5, pb: 4, boxShadow: "none"}}>
            <Paper sx={{ width: 1, pt: 1, pb: 4 }} elevation={4}>
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

                    </ChampionsProvider>
                </LockfileProvider>
            </Paper>
        </Paper>
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
