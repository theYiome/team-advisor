import { app, getCurrentWindow } from '@electron/remote';

const buildPath = (...args: string[]) => {
    return args.map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/[\/]*$/g, '')
        } else {
            return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
        }
    }).filter(x => x.length).join('/')
}

export const userData = app.getPath("userData");
export const configFilePath = (filename: string) => buildPath(userData, filename);

console.log({ userData, configFilePath });

import React, { ReactElement, FC } from 'react';

import { ClientAccess } from './ClientAccess';
import { SmartAccept } from './SmartAccept/SmartAccept';
import { Settings } from './Settings/Settings';

import { LcuProvider } from './LcuProvider';
import { ChampionsProvider } from './ChampionProvider';

import { Box, Tab, Tabs, Paper } from '@mui/material';

import '@fontsource/roboto/400.css';
import { SmartChampionSelect } from './SmartChampionSelect/SmartChampionSelect';

export const TeamAdvisor: React.FC = () => {
    const [tabId, setTabId] = React.useState(0);

    return (
        <Paper elevation={1} sx={{ pl: 2, pr: 1, pt: 5, pb: 4, boxShadow: "none" }}>
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

                <LcuProvider>
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
                </LcuProvider>
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
