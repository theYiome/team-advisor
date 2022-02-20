import React, { ReactElement, FC, useState, useEffect, useContext } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControlLabel, Paper, Stack, Container, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as files from "../../libs/files";

import { ChampionsContext } from '../ChampionProvider';
import { ThemeContext } from '../../app';

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


import { configFilePath } from '../TeamAdvisor';
const settingsPath = configFilePath("settings.settings.json");

export const Settings = () => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const champions = useContext(ChampionsContext);
    const { lightThemeEnabled, setLightThemeEnabled } = useContext(ThemeContext);

    const [autoLauncherEnabled, setAutoLauncherEnabled] = useState(false);

    useEffect(() => {
        if (autoLauncher)
            autoLauncher.isEnabled().then((isEnabled: boolean) => setAutoLauncherEnabled(isEnabled));

        files.loadJSON(settingsPath).then((settings) => {
            setLightThemeEnabled(settings.lightThemeEnabled);
            setSettingsLoaded(true);
        }).catch(error => {
            console.warn(error);
            setSettingsLoaded(true);
        });
    }, []);

    // save settings to file when settings are updated
    useEffect(() => {
        if (settingsLoaded)
            files.saveJSON({ lightThemeEnabled }, settingsPath, 4);
    }, [lightThemeEnabled]);

    const data_table = (
        <TableContainer>
            <Table sx={{ width: 1, fontSize: 1 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>key</TableCell>
                        <TableCell>value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Object.keys(champions).map((key: string) => (
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


    const onAutoLauncherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const onLightThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setLightThemeEnabled(isChecked);
    };

    return (
        <Container>
            <Stack spacing={3}>
                <Typography variant='h6'>General settings</Typography>

                <FormControlLabel
                    control={<Switch checked={autoLauncherEnabled} onChange={onAutoLauncherChange} />}
                    label={<Typography>Launch on system startup</Typography>}
                    disabled={autoLauncher ? false : true}
                />

                <FormControlLabel
                    control={<Switch checked={lightThemeEnabled} onChange={onLightThemeChange} />}
                    label={<Typography>Light theme</Typography>}
                />

                <Typography variant='h6'>Current patch data</Typography>

                {
                    champions ? (
                        <Accordion color='warning'>
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

