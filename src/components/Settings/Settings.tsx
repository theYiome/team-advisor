import React, { ReactElement, FC, useState, useEffect, useContext } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControlLabel, Paper, Stack, Container, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ChampionsContext } from '../ChampionProvider';

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

export const Settings: React.FC = () => {
    const { championIdToName, championNameToId, patch } = useContext(ChampionsContext);
    const [autoLauncherEnabled, setAutoLauncherEnabled] = useState(false);

    useEffect(() => {
        if (autoLauncher)
            autoLauncher.isEnabled().then((isEnabled: boolean) => setAutoLauncherEnabled(isEnabled));
    }, []);

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
                        Object.keys(championNameToId).map((key: string) => (
                            <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">{key}</TableCell>
                                <TableCell component="th" scope="row">{championNameToId[key]}</TableCell>
                            </TableRow>)
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

    return (
        <Container>
            <Stack spacing={3}>
                <Typography variant='h6'>General settings</Typography>

                <FormControlLabel
                    control={<Switch checked={autoLauncherEnabled} onChange={onAutoLauncherChange} />}
                    label={<Typography>Launch on system startup</Typography>}
                    disabled={autoLauncher ? false : true}
                />

                <Typography variant='h6'>Current patch data</Typography>

                {
                    patch !== "" ? (
                        <Accordion color='warning'>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>
                                    Champion data for patch <strong>{patch}</strong>
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

