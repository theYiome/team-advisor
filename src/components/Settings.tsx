import React, { ReactElement, FC, useState, useEffect, useContext } from 'react';
import { Button, ButtonGroup, Container, Stack, Typography } from '@mui/material';
import * as ddragon from '../jsutils/ddragon.js';
import * as files from "../libs/files";


const dirStructure = "data";
const filePath = "data/champions.json";


export const Settings: FC<any> = (): ReactElement => {

    const [championData, setChampionData] = useState(null);

    useEffect(() => {
        try {
            files.loadJSON(filePath).then((localChampionData) => {
                setChampionData(localChampionData);
            });
        } catch(error) {
            console.warn(error);
        }
    }, []);

    const updateStaticChampionData = async () => {
        const versionsArray: any = await ddragon.ddragonVersions();
        const champions = await ddragon.ddragonChampions(versionsArray[0]);
        setChampionData(champions);
        files.saveJSONToDir(champions, filePath, dirStructure, 4);
    }

    return (
        <Container sx={{p: 2}}>
            <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{m: 2, p: 2, boxShadow: 2}}>
                <Button onClick={updateStaticChampionData}>Update static champion data</Button>
                <Button>Button 2</Button>
                <Button>Button 3</Button>
            </ButtonGroup>

            <Stack sx={{m: 2, p: 2, boxShadow: 2}}>
                {championData ? JSON.stringify(championData, null, 4) : "Nothing to display"}
            </Stack>
        </Container>
    );
}