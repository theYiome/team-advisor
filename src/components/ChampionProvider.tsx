import { useSnackbar } from 'notistack';
import React, { useState, createContext, useEffect, useContext } from 'react';

import { ChampionData, ddragonChampions, ddragonVersions } from '../libs/ddragon';
import * as files from "../libs/files";

const ChampionsContext = createContext({} as ChampionData);

import { configFilePath } from './TeamAdvisor';
const filePath = configFilePath("champions.cache.json");

const ChampionsProvider: React.FC = ({children}) => {

    const [champions, setChampions] = useState(useContext(ChampionsContext));
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {

        const loadCachedChampionData = () => {
            files.loadJSON(filePath).then((cachedChampionData) => setChampions(cachedChampionData));
            setTimeout(() => updateStaticChampionData(), 20000);
        };

        const handleFailedLoad = () => {
            enqueueSnackbar("Failed to load champion names for current patch! No internet connection?", {variant: "error"});
            loadCachedChampionData();
        };

        // if getting champion data from ddragon fails, load cache
        updateStaticChampionData().catch(handleFailedLoad);
    }, []);

    const updateStaticChampionData = async () => {
        const versionsArray: string[] = await ddragonVersions();
        const twoWayChampionsDict: ChampionData = await ddragonChampions(versionsArray[0]);

        // two way dict
        // key -> val
        // val -> key
        for (const [key, value] of Object.entries(twoWayChampionsDict)) {
            if (!isNaN(key as any))
                twoWayChampionsDict[value] = key;
        }
        setChampions(twoWayChampionsDict);
        files.saveJSON(twoWayChampionsDict, filePath, 4);
    }

    return (
        <ChampionsContext.Provider value={champions}>
            {children}
        </ChampionsContext.Provider>
    );
}

export { ChampionData, ChampionsContext, ChampionsProvider };