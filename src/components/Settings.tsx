import React, { ReactElement, FC, useState, useEffect, useContext } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControlLabel, Paper, Stack, Container, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as ddragon from '../libs/ddragon';
import * as files from "../libs/files";

import { ChampionsContext } from './ChampionsContext';

let autoLauncher: any = null;

try {
    const AutoLaunch = require('auto-launch');
    autoLauncher = new AutoLaunch({
        name: "Team Advisor",
        isHidden: true
    });
} catch (error) {
    console.warn("Initializing AutoLaunch failed!", error);
}


import { configFilePath } from './TeamAdvisor';
const filePath = configFilePath("champions.json");

export const Settings: FC<any> = (): ReactElement => {

    const [autoLauncherEnabled, setAutoLauncherEnabled] = useState(false);
    const [champions, setChampions] = useContext(ChampionsContext);

    useEffect(() => {

        const loadChampionDataFromFile = () => files.loadJSON(filePath).then((localChampionData) => setChampions(localChampionData));

        updateStaticChampionData().catch(loadChampionDataFromFile);

        if (autoLauncher)
            autoLauncher.isEnabled().then((isEnabled: boolean) => setAutoLauncherEnabled(isEnabled));
    }, []);

    const updateStaticChampionData = async () => {
        const versionsArray: any = await ddragon.ddragonVersions();
        const parsed_champions: any = await ddragon.ddragonChampions(versionsArray[0]);

        // two way dict
        // key -> val
        // val -> key
        for (const [key, value] of Object.entries(parsed_champions)) {
            if (!isNaN(key as any))
                parsed_champions[value as any] = key;
        }
        setChampions(parsed_champions);
        files.saveJSON(parsed_champions, filePath, 4);
    }

    const data_table = (
        <TableContainer component={Paper}>
            <Table sx={{ width: 1, fontSize: 1 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#EEE" }}>
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


    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;

        if (autoLauncher) {
            autoLauncher.isEnabled().then(
                (isEnabled: boolean) => {
                    if (isEnabled && !isChecked)
                        autoLauncher.disable().then(setAutoLauncherEnabled(isChecked));
                    else if (!isEnabled && isChecked)
                        autoLauncher.enable().then(setAutoLauncherEnabled(isChecked));
                }
            );
        }
    };

    return (
        <Container>
            <Stack spacing={3}>
                <FormControlLabel
                    control={<Switch checked={autoLauncherEnabled} onChange={handleSwitchChange} />}
                    label={<Typography><strong>Launch on system startup</strong></Typography>}
                    disabled={autoLauncher ? false : true}
                />
                <Button onClick={updateStaticChampionData} variant="outlined">Update static champion data</Button>
                {
                    champions ? (
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>
                                    Champion data for patch <strong>{champions["patch"]}</strong>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {data_table}
                            </AccordionDetails>
                        </Accordion>
                    )
                        : (
                            "Nothing to display"
                        )
                }
            </Stack>
        </Container>
    );
}

