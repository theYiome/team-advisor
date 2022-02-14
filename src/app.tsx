import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TeamAdvisor } from './components/TeamAdvisor';
import { darkTheme, lightTheme } from './components/Themes'
import { ThemeProvider} from '@mui/material/styles';

function render() {
    ReactDOM.render(
        <ThemeProvider theme={darkTheme}>
            <TeamAdvisor/>
        </ThemeProvider>, 
        document.getElementById("app")
    );
}

render();