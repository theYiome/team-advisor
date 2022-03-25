import { app } from '@electron/remote';

const buildPath = (...args: string[]) => {
    return args.map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/[\/]*$/g, '');
        } else {
            return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
        }
    }).filter(x => x.length).join('/');
};

export const userData = app.getPath("userData");
export const configFilePath = (filename: string) => buildPath(userData, filename);

console.log({ userData, configFilePath });

import React from 'react';

import { ClientAccess } from './ClientAccess';
import { GeneralSettings } from './Settings/GeneralSettings';

import { Box, Tab, Tabs, Paper, Stack, Tooltip, Container, Divider } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DataArrayIcon from '@mui/icons-material/DataArray';
import FavoriteIcon from '@mui/icons-material/Favorite';

import '@fontsource/roboto/400.css';
import { SmartChampionSelect } from './SmartChampionSelect';
import { QuickSettings } from './QuickSettings';
import { VideoAd400x300 } from './VideoAd400x300';
import { ChampionData } from './ChampionData';
import { FavouriteChampions } from './FavouriteChampions';

export const TeamAdvisor: React.FC = () => {
    const [tabId, setTabId] = React.useState(0);

    return (
        <Paper sx={{ width: 1, height: 1, pt: 4 }} elevation={4}>
            <Stack direction="row" sx={{ height: 1 }}>
                <Paper sx={{ borderRight: 1, borderColor: 'divider', pt: 1 }}>
                    <Tabs
                        value={tabId}
                        onChange={(event: any, nextTabId: number) => setTabId(nextTabId)}
                        aria-label="main navigation tabs"
                        orientation='vertical'
                        centered
                    >
                        <Tooltip title="Champion select & pick predictions" placement="right" enterDelay={0}>
                            <Tab label={<SportsEsportsIcon fontSize='large' />} {...a11yProps(0)} />
                        </Tooltip>
                        <Tooltip title="Favourites" placement="right" enterDelay={0}>
                            <Tab label={<FavoriteIcon fontSize='large' />} {...a11yProps(1)} />
                        </Tooltip>
                        <Tooltip title="LCU status" placement="right" enterDelay={0}>
                            <Tab label={<AnnouncementIcon fontSize='large' />} {...a11yProps(2)} />
                        </Tooltip>
                        <Tooltip title="Supported champions" placement="right" enterDelay={0}>
                            <Tab label={<DataArrayIcon fontSize='large' />} {...a11yProps(3)} />
                        </Tooltip>
                        <Tooltip title="Settings" placement="right" enterDelay={0}>
                            <Tab label={<SettingsApplicationsIcon fontSize='large' />} {...a11yProps(4)} />
                        </Tooltip>
                    </Tabs>
                </Paper>
                <Box sx={{ width: 1, pt: 2, pb: 2, borderRight: 1, borderColor: 'divider' }} className="scroll-enabled">
                    <TabPanel value={tabId} index={0}>
                        <SmartChampionSelect />
                    </TabPanel>
                    <TabPanel value={tabId} index={1}>
                        <FavouriteChampions />
                    </TabPanel>
                    <TabPanel value={tabId} index={2}>
                        <ClientAccess />
                    </TabPanel>
                    <TabPanel value={tabId} index={3}>
                        <ChampionData />
                    </TabPanel>
                    <TabPanel value={tabId} index={4}>
                        <GeneralSettings />
                    </TabPanel>
                </Box>
                <Stack sx={{ width: 400, mr: 1, ml: 1, pt: 2 }}>
                    <VideoAd400x300 />
                    <Container sx={{ height: 1, mt: 2 }} className="scroll-enabled">
                        <QuickSettings />
                    </Container>
                </Stack>
            </Stack>
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
