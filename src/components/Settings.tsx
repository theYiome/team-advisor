import React, { ReactElement, FC, useState, useEffect, useContext } from 'react';
import { Button, ButtonGroup, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import * as ddragon from '../jsutils/ddragon.js';
import * as files from "../libs/files";

import { ChampionsContext } from './ChampionsContext';
import { protocol } from 'electron';


const filePath = "data/champions.json";


export const Settings: FC<any> = (): ReactElement => {

    const [champions, setChampions] = useContext(ChampionsContext);

    useEffect(() => {
        try {
            files.loadJSON(filePath).then((localChampionData) => {
                setChampions(localChampionData);
            });
        } catch(error) {
            console.warn(error);
        }
    }, []);

    const updateStaticChampionData = async () => {
        const versionsArray: any = await ddragon.ddragonVersions();
        const parsed_champions: any = await ddragon.ddragonChampions(versionsArray[0]);

        // two way dict
        // key -> val
        // val -> key
        for (const [key, value] of Object.entries(parsed_champions)) {
            if(!isNaN(key as any))
                parsed_champions[value as any] = key;
        }

        setChampions(parsed_champions);
        files.saveJSON(parsed_champions, filePath, 4);
    }

    const data_table = (
        <TableContainer component={Paper}>
            <Table sx={{ width: 1, fontSize: 1 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow sx={{backgroundColor: "#EEE"}}>
                        <TableCell>key</TableCell>
                        <TableCell>value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Object.keys(champions).map((key: string) => 
                            (
                                <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{key}</TableCell>
                                    <TableCell component="th" scope="row">{champions[key]}</TableCell>
                                </TableRow>
                            )
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Stack spacing={3}>
            <Button onClick={updateStaticChampionData} variant="outlined">Update static champion data</Button>
            <Typography variant='h6'>
                Champions
            </Typography>
            {champions ? data_table : "Nothing to display"}
        </Stack>
    );
}