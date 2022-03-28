import React, { useReducer, createContext, useEffect } from 'react';
import { defaultBottom, defaultJungle, defaultMiddle, defaultSupport, defaultTop } from '../Settings/SettingsConstants';

export interface FavouritesContent {
    top: string[],
    jungle: string[],
    middle: string[],
    bottom: string[],
    support: string[],
    utility: string[],
    "": string[]
}

const areFavouritesValid = (favourites: FavouritesContent) => {
    for (const key of Object.keys(favourites)) {
        const k = key as "top" | "jungle" | "middle" | "bottom" | "support" | "utility" | "";
        const favouritesValid = favourites[k].every((value, index) => {
            if (typeof (value) !== typeof ("") || !isNaN(value as any))
                return false;
            return true;
        });
        if (!favouritesValid)
            return false;
    }
    return true;
}

const initialFavourites: FavouritesContent = {
    top: defaultTop,
    jungle: defaultJungle,
    middle: defaultMiddle,
    bottom: defaultBottom,
    support: defaultSupport,
    utility: defaultSupport,
    "": ["Annie", "Olaf", "Galio", "TwistedFate", "XinZhao", "Urgot", "Leblanc", "Vladimir"]
};

export interface FavouritesAction {
    type: FavouritesActionType,
    payload?: any
}

export enum FavouritesActionType {
    SetAll,
    SetTheme,
    SetFavouritesTop,
    SetFavouritesJungle,
    SetFavouritesMiddle,
    SetFavouritesBottom,
    SetFavouritesSupport,
}

const FavouritesContext = createContext({
    favourites: initialFavourites,
    favouritesDispatch: (action: FavouritesAction) => { console.error({action}) }
});

const reducer = (state: FavouritesContent, action: FavouritesAction): FavouritesContent => {
    console.log({state, action});
    switch (action.type) {
        case FavouritesActionType.SetAll:
            return action.payload;
        case FavouritesActionType.SetFavouritesTop:
            return { ...state, top: action.payload };
        case FavouritesActionType.SetFavouritesJungle:
            return { ...state, jungle: action.payload };
        case FavouritesActionType.SetFavouritesMiddle:
            return { ...state, middle: action.payload };
        case FavouritesActionType.SetFavouritesBottom:
            return { ...state, bottom: action.payload };
        case FavouritesActionType.SetFavouritesSupport:
            return { ...state, support: action.payload };
        default:
            throw new Error();
    }
}

const FavouritesProvider: React.FC = ({ children }) => {
    const [favourites, favouritesDispatch] = useReducer(reducer, initialFavourites);

    useEffect(() => {
        localStorage.setItem("FavouritesProvider", JSON.stringify(favourites));
    }, [favourites]);

    useEffect(() => {
        const localStorageContent: string = localStorage.getItem("FavouritesProvider");
        const favouritesObj: FavouritesContent = JSON.parse(localStorageContent);
        if (areFavouritesValid(favouritesObj)) {
            console.log({ favouritesObj });
            favouritesDispatch({
                type: FavouritesActionType.SetAll,
                payload: favouritesObj
            });
        }
        else console.warn("FavouritesProvider: localStorage content is invalid", { localStorageContent });
    }, []);

    return (
        <FavouritesContext.Provider value={{ favourites, favouritesDispatch }}>
            {children}
        </FavouritesContext.Provider>
    );
}

export { FavouritesProvider, FavouritesContext };