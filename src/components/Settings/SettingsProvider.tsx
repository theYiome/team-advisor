import React, { useReducer, createContext, useEffect } from 'react';

export interface SettingsContent {
    theme: "dark" | "light";
    prefferedBans: string[];
    autoAccept: boolean;
    autoBan: boolean;
    autoPick: boolean;
    championLockinTimer: number;
    gameAcceptTimer: number;
    leagueInstallationPath: string;
}

const validateSettingsContent = (settings: SettingsContent): boolean => {
    try {

        const prefferedBansValid = settings.prefferedBans.every((value, index) => {
            if (typeof (value) !== typeof ("") || !isNaN(value as any))
                return false;
            return true;
        });

        return prefferedBansValid &&
            settings.championLockinTimer > 0 &&
            settings.gameAcceptTimer > 0;

    } catch (error) {
        console.error({ error, settings, message: "Settings object is invalid" });
    }
    return false
}

const initialSettings: SettingsContent = {
    theme: "dark" as "dark" | "light",
    prefferedBans: ["Jax", "Viktor", "Lulu", "Riven"],
    autoAccept: true,
    autoBan: true,
    autoPick: true,
    championLockinTimer: 31.0,
    gameAcceptTimer: 2,
    leagueInstallationPath: "C:\\Riot Games\\League of Legends\\",
};

export interface SettingsAction {
    type: SettingsActionType,
    payload?: any
}

export enum SettingsActionType {
    SetAll,
    SetTheme,
    SetPrefferedBans,
    SetAutoAccept,
    SetAutoBan,
    SetAutoPick,
    SetChampionLockinTimer,
    SetGameAcceptTimer,
    SetLeagueInstallationPath
}

const SettingsContext = createContext({
    settings: initialSettings,
    settingsDispatch: (action: SettingsAction) => { }
});


const reducer = (state: SettingsContent, action: SettingsAction): SettingsContent => {
    switch (action.type) {
        case SettingsActionType.SetAll:
            return action.payload;
        case SettingsActionType.SetGameAcceptTimer:
            return { ...state, gameAcceptTimer: action.payload };
        case SettingsActionType.SetTheme:
            return { ...state, theme: action.payload };
        case SettingsActionType.SetAutoAccept:
            return { ...state, autoAccept: action.payload };
        case SettingsActionType.SetAutoBan:
            return { ...state, autoBan: action.payload };
        case SettingsActionType.SetAutoPick:
            return { ...state, autoPick: action.payload };
        case SettingsActionType.SetChampionLockinTimer:
            return { ...state, championLockinTimer: action.payload };
        case SettingsActionType.SetGameAcceptTimer:
            return { ...state, gameAcceptTimer: action.payload };
        case SettingsActionType.SetLeagueInstallationPath:
            return { ...state, leagueInstallationPath: action.payload };
        case SettingsActionType.SetPrefferedBans:
            return { ...state, prefferedBans: action.payload };
        default:
            throw new Error();
    }
}

const SettingsProvider: React.FC = ({ children }) => {

    console.log("SettingsProvider");

    const [settings, settingsDispatch] = useReducer(reducer, initialSettings);

    useEffect(() => {
        localStorage.setItem("SettingsProvider", JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const localStorageContent: string = localStorage.getItem("SettingsProvider");
        const settingsObj: SettingsContent = JSON.parse(localStorageContent);
        if (validateSettingsContent(settingsObj)) {
            console.log({ settingsObj });
            settingsDispatch({
                type: SettingsActionType.SetAll,
                payload: settingsObj
            });
        }
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, settingsDispatch }}>
            {children}
        </SettingsContext.Provider>
    );
}

export { SettingsProvider, SettingsContext };