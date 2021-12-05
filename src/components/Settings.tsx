import React, { ReactElement, FC, useState, useContext } from 'react';

import * as ddragon from '../jsutils/ddragon.js';

import { Button, Container, Typography } from '@mui/material';
import * as files from "../libs/files";

export const Settings: FC<any> = (): ReactElement => {

    const updateStaticChampionData = async () => {
        const versionsArray: any = await ddragon.ddragonVersions();

        // const settings = await settingsModule.loadSetting();
        // settingsModule.saveSettings(settings);
        try {
            const localChampionData = await files.loadJSON("data/champion.json")
            if(localChampionData.patch != versionsArray[0]) {
                console.log(`You should update assets to new patch: ${localChampionData.patch} != ${versionsArray[0]}`);
                const champions = await ddragon.ddragonChampions(versionsArray[0]);
                files.saveJSON(champions, "data/champion.json", 4)
            }
            console.log(`Already latest patch: ${localChampionData.patch} === ${versionsArray[0]}`);
        } catch(err) {
            console.warn(err);
            const champions = await ddragon.ddragonChampions(versionsArray[0]);
            files.saveJSON(champions, "data/champion.json", 4)
        }
    }

    return (
        <Container sx={{p: 2}}>
            <Button variant="contained" onClick={updateStaticChampionData}>Update static champion data</Button>
        </Container>
    );
}