import { useSnackbar } from 'notistack';
import React, { useReducer, useState, createContext, useEffect, useContext } from 'react';

import { ChampionData, ddragonChampions, ddragonVersions } from '../../libs/ddragon';
import * as files from "../../libs/files";

import { configFilePath } from '../TeamAdvisor';
const filePath = configFilePath("settings.settings.json");

const initialSettingsState = {
    count: 1
};

interface SettingsAction {
    type: string,
    value?: any
}

export const SettingsContext = createContext({
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

export const SettingsProvider: React.FC = ({ children }) => {

    const [settingsState, settingsDispatch] = useReducer(reducer, initialSettingsState);
    const { enqueueSnackbar } = useSnackbar();

    return (
        <SettingsContext.Provider value={{ settingsState, settingsDispatch }}>
            {children}
        </SettingsContext.Provider>
    );
}

export { ChampionData };