import { ChampionsProvider } from "./ChampionProvider";
import { LcuProvider } from "./LcuProvider";


import React, { useEffect, useContext } from 'react';
import { TeamAdvisor } from './TeamAdvisor';
import { themesMap } from './Themes'
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { Paper } from '@mui/material';
import { SettingsContext } from "./Settings/SettingsProvider";
import { ClientStateProvider } from "./ClientState/ClientStateProvider";


export const Main: React.FC = () => {

    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        if (themesMap[settings.theme].palette.mode = "dark") {
            document.getElementById("titlebar").style.backgroundColor = "transparent";
            document.getElementsByTagName("body")[0].style.backgroundColor = "#141414";
        }
        else {
            document.getElementById("titlebar").style.backgroundColor = "transparent";
            document.getElementsByTagName("body")[0].style.backgroundColor = "white";
        }
    }, [settings.theme]);

    return (
        <ThemeProvider theme={themesMap[settings.theme]}>
            <SnackbarProvider maxSnack={4} anchorOrigin={{horizontal: "right", vertical: "bottom"}}>
                <LcuProvider>
                    <ChampionsProvider>
                        <ClientStateProvider>
                                <TeamAdvisor />
                        </ClientStateProvider>
                    </ChampionsProvider>
                </LcuProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}