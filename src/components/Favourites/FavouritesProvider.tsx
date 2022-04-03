import React, { useReducer, createContext, useEffect, useState } from 'react';
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
        const k = key as keyof FavouritesContent;
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
    "": []
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

const MAX_FAVOURITES = 10;

const FavouritesContext = createContext({
    favourites: initialFavourites,
    favouritesDispatch: (action: FavouritesAction) => { console.error({action}) }
});

const reducer = (state: FavouritesContent, action: FavouritesAction): FavouritesContent => {
    console.log({state, action});

    if([FavouritesActionType.SetFavouritesTop, 
        FavouritesActionType.SetFavouritesJungle, 
        FavouritesActionType.SetFavouritesMiddle, 
        FavouritesActionType.SetFavouritesBottom,
        FavouritesActionType.SetFavouritesSupport].includes(action.type)) {
            if (action.payload.length > MAX_FAVOURITES)
                return state;
    }

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
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (loaded)
            localStorage.setItem("FavouritesProvider", JSON.stringify(favourites));
    }, [favourites]);

    useEffect(() => {
        const localStorageContent: string = localStorage.getItem("FavouritesProvider");

        if (localStorageContent) {
            const favouritesObj: FavouritesContent = JSON.parse(localStorageContent);
            if (areFavouritesValid(favouritesObj)) {
                console.log("Favourites loaded from localStorage", { favouritesObj });
                favouritesDispatch({ type: FavouritesActionType.SetAll, payload: favouritesObj });
            }
            else console.warn("FavouritesProvider: localStorage content is invalid", { localStorageContent });
        }
        setLoaded(true);
    }, []);

    return (
        <FavouritesContext.Provider value={{ favourites, favouritesDispatch }}>
            {children}
        </FavouritesContext.Provider>
    );
}

export { FavouritesProvider, FavouritesContext, MAX_FAVOURITES };