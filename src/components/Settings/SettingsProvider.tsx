import React, { useReducer, createContext } from 'react';
import * as files from "../../libs/files";

import { configFilePath } from '../TeamAdvisor';
import { defaultBottom, defaultJungle, defaultMiddle, defaultSupport, defaultTop } from './SettingsConstants';

const filePath = configFilePath("settings.settings.json");

const initialSettingsState = {
    theme: "dark" as "dark" | "light",
    favourites: {
        top: defaultTop,
        jungle: defaultJungle,
        middle: defaultMiddle,
        bottom: defaultBottom,
        support: defaultSupport,
        utility: defaultSupport,
        "": [...defaultTop, ...defaultJungle, ...defaultMiddle, ...defaultBottom, ...defaultSupport]
    },
    prefferedBans: ["Jax", "Viktor", "Lulu", "Riven"],
    autoAccept: true,
    autoBan: true,
    autoPick: true,
    championLockinTimer: 31.0,
    gameAcceptTimer: 2,
    leagueInstallationPath: "C:\\Riot Games\\League of Legends\\",
};

interface SettingsAction {
    type: string,
    value?: any
}

const SettingsContext = createContext({
    settingsState: initialSettingsState,
    settingsDispatch: (action: SettingsAction) => { }
});


const reducer = (state: any, action: SettingsAction) => {
    switch (action.type) {
        case 'increment':
            return {
                ...state,
                count: state.count + 1
            }
        case 'decrement':
            return {
                ...state,
                count: state.count + 1
            }
        default:
            throw new Error();
    }
}

const SettingsProvider: React.FC = ({ children }) => {

    const [settingsState, settingsDispatch] = useReducer(reducer, initialSettingsState);

    return (
        <SettingsContext.Provider value={{ settingsState, settingsDispatch }}>
            {children}
        </SettingsContext.Provider>
    );
}

export { SettingsProvider, SettingsContext };