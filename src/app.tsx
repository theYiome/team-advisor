import React from 'react';
import * as ReactDOM from 'react-dom';
import { SettingsProvider } from './components/Settings/SettingsProvider';
import { Main } from './components/Main';


const render = () => {
    ReactDOM.render(
        <SettingsProvider>
            <Main />
        </SettingsProvider>,
        document.getElementById("app"));
}

render();