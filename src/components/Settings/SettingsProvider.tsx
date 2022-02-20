import { useSnackbar } from 'notistack';
import React, { useReducer, useState, createContext, useEffect, useContext } from 'react';

import { ChampionData, ddragonChampions, ddragonVersions } from '../../libs/ddragon';
import * as files from "../../libs/files";

import { configFilePath } from '../TeamAdvisor';
import { defaultBottom, defaultJungle, defaultMiddle, defaultSupport, defaultTop } from './SettingsConstants';

const filePath = configFilePath("settings.settings.json");

const initialSettingsState = {
    theme: "Dark",
    favourites: {
        top: defaultTop,
        jungle: defaultJungle,
        middle: defaultMiddle,
        bottom: defaultBottom,
        support: defaultSupport
    },
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
    const { enqueueSnackbar } = useSnackbar();

    return (
        <SettingsContext.Provider value={{ settingsState, settingsDispatch }}>
            {children}
        </SettingsContext.Provider>
    );
}

export { ChampionData, SettingsProvider, SettingsContext };