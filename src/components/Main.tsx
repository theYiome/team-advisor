import { ChampionsProvider } from "./Champions/ChampionProvider";
import { LcuProvider } from "./LCU/LcuProvider";


import React, { useEffect, useContext } from 'react';
import { TeamAdvisor } from './TeamAdvisor';
import { themesMap } from './Themes'
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { SettingsContext } from "./Settings/SettingsProvider";
import { ClientStateProvider } from "./ClientState/ClientStateProvider";
import { FavouritesProvider } from "./Favourites/FavouritesProvider";


export const Main: React.FC = () => {

    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        try {
            (document.querySelector(".scroll-enabled") as HTMLElement).style.setProperty("--scrollbar-background", themesMap[settings.theme].palette.primary.main);
            document.getElementById("titlebar").style.backgroundColor = "#222"; 
        }
        catch(error) {
            console.warn("Failed to set theme!", error);
        }
    }, [settings.theme]);

    return (
        <ThemeProvider theme={themesMap[settings.theme]}>
            <SnackbarProvider maxSnack={4} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <LcuProvider>
                    <ChampionsProvider>
                        <FavouritesProvider>
                            <ClientStateProvider>
                                <TeamAdvisor />
                            </ClientStateProvider>
                        </FavouritesProvider>
                    </ChampionsProvider>
                </LcuProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}