import { ChampionsProvider } from "./ChampionProvider";
import { LcuProvider } from "./LcuProvider";


import React, { useEffect, useContext } from 'react';
import { TeamAdvisor } from './TeamAdvisor';
import { themesMap } from './Themes'
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { Paper } from '@mui/material';
import { SettingsContext } from "./Settings/SettingsProvider";


export const Main: React.FC = () => {

    const { settingsState } = useContext(SettingsContext);

    useEffect(() => {
        if (themesMap[settingsState.theme].palette.mode = "dark") {
            document.getElementById("titlebar").style.backgroundColor = "transparent";
            document.getElementsByTagName("body")[0].style.backgroundColor = "#141414";
        }
        else {
            document.getElementById("titlebar").style.backgroundColor = "transparent";
            document.getElementsByTagName("body")[0].style.backgroundColor = "white";
        }
    }, [settingsState.theme]);

    return (
        <ThemeProvider theme={themesMap[settingsState.theme]}>
            <SnackbarProvider maxSnack={4}>
                <LcuProvider>
                    <ChampionsProvider>
                        <Paper elevation={0}>
                            <TeamAdvisor />
                        </Paper>
                    </ChampionsProvider>
                </LcuProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}