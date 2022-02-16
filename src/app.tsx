import React, { ReactElement, FC, useState, useEffect, createContext } from 'react';
import * as ReactDOM from 'react-dom';
import { TeamAdvisor } from './components/TeamAdvisor';
import { darkTheme, lightTheme } from './components/Themes'
import { ThemeProvider } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const ThemeContext = createContext({
    lightThemeEnabled: false,
    setLightThemeEnabled: (newValue: boolean) => {}
});

const MainApp = () => {
    const [lightThemeEnabled, setLightThemeEnabled] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(darkTheme);

    useEffect(() => {
        if (lightThemeEnabled) {
            setCurrentTheme(lightTheme);
            document.getElementById("titlebar").style.backgroundColor = "#444";
            document.getElementsByTagName("body")[0].style.backgroundColor = "white";
        } else {
            setCurrentTheme(darkTheme);
            document.getElementById("titlebar").style.backgroundColor = "transparent";
            document.getElementsByTagName("body")[0].style.backgroundColor = "#020202";
        }
    }, [lightThemeEnabled]);

    return (
        <ThemeContext.Provider value={{lightThemeEnabled, setLightThemeEnabled}}>
            <ThemeProvider theme={currentTheme}>
                <Paper elevation={0}>
                    <TeamAdvisor />
                </Paper>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

const render = () => {
    ReactDOM.render(<MainApp/>, document.getElementById("app"));
}

render();