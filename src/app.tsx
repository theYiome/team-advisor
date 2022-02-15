import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TeamAdvisor } from './components/TeamAdvisor';
import { darkTheme, lightTheme } from './components/Themes'
import { ThemeProvider } from '@mui/material/styles';
import { Paper } from '@mui/material';

function render() {
    ReactDOM.render(
        <ThemeProvider theme={darkTheme}>
            <Paper elevation={0}>
                <TeamAdvisor />
            </Paper>
        </ThemeProvider>
        ,
        document.getElementById("app")
    );
}

render();