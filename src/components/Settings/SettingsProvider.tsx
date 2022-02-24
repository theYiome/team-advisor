import React, { useReducer, createContext, useEffect } from 'react';
import { defaultBottom, defaultJungle, defaultMiddle, defaultSupport, defaultTop } from './SettingsConstants';

export interface SettingsContent {
    theme: "dark" | "light";
    favourites: {
        top: string[];
        jungle: string[];
        middle: string[];
        bottom: string[];
        support: string[];
        utility: string[];
        "": string[];
    };
    prefferedBans: string[];
    autoAccept: boolean;
    autoBan: boolean;
    autoPick: boolean;
    championLockinTimer: number;
    gameAcceptTimer: number;
    leagueInstallationPath: string;
}

const areFavouritesValid = (settings: SettingsContent) => {
    for (const key of Object.keys(settings.favourites)) {
        const k = key as "top" | "jungle" | "middle" | "bottom" | "support" | "utility" | "";
        const favouritesValid = settings.favourites[k].every((value, index) => {
            if (typeof (value) !== typeof ("") || !isNaN(value as any))
                return false;
            return true;
        });
        if (!favouritesValid)
            return false;
    }
    return true;
}

const validateSettingsContent = (settings: SettingsContent): boolean => {
    try {
        const favouritesValid = areFavouritesValid(settings);

        const prefferedBansValid = settings.prefferedBans.every((value, index) => {
            if (typeof (value) !== typeof ("") || !isNaN(value as any))
                return false;
            return true;
        });

        return favouritesValid &&
            prefferedBansValid &&
            settings.championLockinTimer > 0 &&
            settings.gameAcceptTimer > 0;

    } catch (error) {
        console.error({ error, settings, message: "Settings object is invalid" });
    }
    return false
}

const initialSettingsState: SettingsContent = {
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

export interface SettingsAction {
    type: SettingsActionType,
    payload?: any
}

export enum SettingsActionType {
    SetAll,
    SetTheme,
    SetFavouritesTop,
    SetFavouritesJungle,
    SetFavouritesMiddle,
    SetFavouritesBottom,
    SetFavouritesSupport,
    SetPrefferedBans,
    SetAutoAccept,
    SetAutoBan,
    SetAutoPick,
    SetChampionLockinTimer,
    SetGameAcceptTimer,
    SetLeagueInstallationPath
}

const SettingsContext = createContext({
    settingsState: initialSettingsState,
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
        default:
            throw new Error();
    }
}

const SettingsProvider: React.FC = ({ children }) => {

    console.log("SettingsProvider");

    const [settingsState, settingsDispatch] = useReducer(reducer, initialSettingsState);

    useEffect(() => {
        localStorage.setItem("SettingsProvider", JSON.stringify(settingsState));
    }, [settingsState]);

    useEffect(() => {
        const localStorageContent: string = localStorage.getItem("SettingsProvider");
        const localStorageObj: SettingsContent = JSON.parse(localStorageContent);
        if (validateSettingsContent(localStorageObj)) {
            console.log({ localStorageObj });
            settingsDispatch({
                type: SettingsActionType.SetAll,
                payload: localStorageObj
            });
        }
    }, []);

    return (
        <SettingsContext.Provider value={{ settingsState, settingsDispatch }}>
            {children}
        </SettingsContext.Provider>
    );
}

export { SettingsProvider, SettingsContext };