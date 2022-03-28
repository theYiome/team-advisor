import { useSnackbar } from 'notistack';
import React, { useState, createContext, useEffect } from 'react';

import { ChampionIdToNameData, ChampionNameToIdData, ddragonChampions, ddragonVersions } from '../../libs/ddragon';

const ChampionsContext = createContext({
    championIdToName: {} as ChampionIdToNameData,
    championNameToId: {} as ChampionNameToIdData,
    patch: ""
});

const ChampionsProvider: React.FC = ({ children }) => {

    const [championIdToName, setChampionIdToName] = useState({} as ChampionIdToNameData);
    const [championNameToId, setChampionNameToId] = useState({} as ChampionNameToIdData);
    const [patch, setPatch] = useState("");

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const handleFailedLoad = () => {
            enqueueSnackbar("Failed to load champion names for current patch! No internet connection?", { variant: "error" });
            setTimeout(
                () => updateStaticChampionData(),
                5000
            );
        };

        // if getting champion data from ddragon fails, load cache
        updateStaticChampionData().catch(handleFailedLoad);
    }, []);

    const updateStaticChampionData = async () => {
        const versionsArray: string[] = await ddragonVersions();
        const newPatch: string = versionsArray[0];

        const newChampionIdToName: ChampionIdToNameData = await ddragonChampions(newPatch);
        newChampionIdToName[0] = "";
        
        const newChampionNameToId: ChampionNameToIdData = {};

        for (const strId of Object.keys(newChampionIdToName)) {
            const id = parseInt(strId);
            const name = newChampionIdToName[id];
            newChampionNameToId[name] = id;
        }

        console.log({ newChampionIdToName, newChampionNameToId });
        
        setChampionIdToName(newChampionIdToName);
        setChampionNameToId(newChampionNameToId);
        setPatch(newPatch);
    }

    return (
        <ChampionsContext.Provider value={{championIdToName, championNameToId, patch}}>
            {children}
        </ChampionsContext.Provider>
    );
}

export { ChampionsContext, ChampionsProvider };