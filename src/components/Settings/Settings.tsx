import React, { ReactElement, FC, useState, useEffect, useContext } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControlLabel, Paper, Stack, Container, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, AlertTitle, Slider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ChampionsContext } from '../ChampionProvider';
import { SettingsActionType, SettingsContext } from './SettingsProvider';

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
    const { championNameToId, patch } = useContext(ChampionsContext);
    const [autoLauncherEnabled, setAutoLauncherEnabled] = useState(false);

    const { settings, settingsDispatch } = useContext(SettingsContext);

    const [gameAcceptTimer, setGameAcceptTimer] = useState(0);

    useEffect(() => {
        if (autoLauncher)
            autoLauncher.isEnabled().then((isEnabled: boolean) => setAutoLauncherEnabled(isEnabled));
    }, []);

    const dataTable = (
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

    // const settingsDrawer = (
    //     <Stack sx={{ mt: 4, p: 2 }} spacing={2} className={"scroll_enabled"}>
    //         <FormControlLabel
    //             control={
    //                 <Switch
    //                     checked={smartBanEnabled}
    //                     onChange={(event) => setSmartBanEnabled(event.target.checked)}
    //                 />
    //             }
    //             label={<Typography>Smart Ban</Typography>}
    //         />
    //         <Alert severity="info">
    //             When banning phase starts,
    //             app will hover first champion from your list that is not <strong>already banned</strong> and
    //             is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally.

    //             <ul>
    //                 <li>App will adjust this hover in real time.</li>
    //                 <li>If no champion from your ban list matches criteria, nothing will be hovered.</li>
    //                 <li>Hovering something by yourself takes control from the app.</li>
    //             </ul>
    //         </Alert>

    //         <FormControlLabel
    //             control={
    //                 <Switch
    //                     checked={smartPickEnabled}
    //                     onChange={(event) => setSmartPickEnabled(event.target.checked)}
    //                 />
    //             }
    //             label={<Typography>Smart Pick</Typography>}
    //         />

    //         <Alert severity="info">
    //             When your picking phase starts,
    //             app will hover first champion that <strong>you own</strong> from list for your <strong>current role</strong> that is not <strong>already banned</strong> and
    //             is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally and <strong>you own</strong>.
    //             It will also <strong>lock in</strong> any champion you hover when timer reaches zero.

    //             <ul>
    //                 <li>App will adjust this hover if somebody picks your champion</li>
    //                 <li>If no champion from your list matches criteria, nothing will be hovered.</li>
    //                 <li>Auto lock in does not work in custom games.</li>
    //             </ul>
    //         </Alert>

    //         <Box sx={{ p: 2 }}>
    //             <Typography>Auto lockin timer adjustment (better leave as is, {defaultLockinAt.toFixed(1)} is recommended)</Typography>
    //             <Slider
    //                 sx={{ width: "90%", ml: "5%" }}
    //                 value={lockinAt}
    //                 onChange={onLockinAtChange}
    //                 marks={[{ value: 0, label: "Instant lockin" }, { value: 32, label: "To late" }]}
    //                 min={0}
    //                 max={40}
    //                 step={0.5}
    //                 valueLabelDisplay="auto"
    //             />
    //         </Box>

    //         <Stack spacing={2}>
    //             <Typography>
    //                 Ban list
    //             </Typography>
    //             <MultipleChampionPicker
    //                 championNames={championNames}
    //                 currentList={banList}
    //                 patch={patch}
    //                 onChange={(newBanList) => setBanList(newBanList)}
    //                 label="Ban list"
    //                 variant="outlined"
    //             />
    //             <Typography>
    //                 Champion lists
    //             </Typography>

    //             <Stack direction="row">
    //                 <IconButton
    //                     aria-label="Reset top to defaults"
    //                     onClick={() => setTopChampionList(defaultChampionsForRole.top)}
    //                 >
    //                     <RestartAltIcon />
    //                 </IconButton>

    //                 <MultipleChampionPicker
    //                     championNames={championNames}
    //                     currentList={topChampionList}
    //                     patch={patch}
    //                     onChange={(newList) => setTopChampionList(newList)}
    //                     label="Top"
    //                 />
    //             </Stack>

    //             <Stack direction="row">
    //                 <IconButton
    //                     aria-label="Reset jungle to defaults"
    //                     onClick={() => setJungleChampionList(defaultChampionsForRole.jungle)}
    //                 >
    //                     <RestartAltIcon />
    //                 </IconButton>

    //                 <MultipleChampionPicker
    //                     championNames={championNames}
    //                     currentList={jungleChampionList}
    //                     patch={patch}
    //                     onChange={(newList) => setJungleChampionList(newList)}
    //                     label="Jungle"
    //                 />
    //             </Stack>

    //             <Stack direction="row">
    //                 <IconButton
    //                     aria-label="Reset middle to defaults"
    //                     onClick={() => setMiddleChampionList(defaultChampionsForRole.middle)}
    //                 >
    //                     <RestartAltIcon />
    //                 </IconButton>

    //                 <MultipleChampionPicker
    //                     championNames={championNames}
    //                     currentList={middleChampionList}
    //                     patch={patch}
    //                     onChange={(newList) => setMiddleChampionList(newList)}
    //                     label="Middle"
    //                 />
    //             </Stack>

    //             <Stack direction="row">
    //                 <IconButton
    //                     aria-label="Reset bottom to defaults"
    //                     onClick={() => setBottomChampionList(defaultChampionsForRole.bottom)}>
    //                     <RestartAltIcon />
    //                 </IconButton>

    //                 <MultipleChampionPicker
    //                     championNames={championNames}
    //                     currentList={bottomChampionList}
    //                     patch={patch}
    //                     onChange={(newList) => setBottomChampionList(newList)}
    //                     label="Bottom"
    //                 />
    //             </Stack>

    //             <Stack direction="row">
    //                 <IconButton
    //                     aria-label="Reset support to defaults"
    //                     onClick={() => setSupportChampionList(defaultChampionsForRole.support)}>
    //                     <RestartAltIcon />
    //                 </IconButton>

    //                 <MultipleChampionPicker
    //                     championNames={championNames}
    //                     currentList={supportChampionList}
    //                     patch={patch}
    //                     onChange={(newList) => setSupportChampionList(newList)}
    //                     label="Support"
    //                 />
    //             </Stack>
    //         </Stack>
    //     </Stack>
    // );

    useEffect(() => {
        setGameAcceptTimer(settings.gameAcceptTimer);
    }, [settings.gameAcceptTimer])


    const handleTimerChange = (event: Event, newValue: number, activeThumb: number) => {
        if (newValue !== gameAcceptTimer)
            setGameAcceptTimer(newValue);
    }

    const commitTimerChange = (event: React.SyntheticEvent | Event, newValue: number) => {
        settingsDispatch({ type: SettingsActionType.SetGameAcceptTimer, payload: newValue });
    }

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

                <Stack>
                    <Alert severity="info">
                        <AlertTitle>When my game will be accepted?</AlertTitle>
                        After <strong> {gameAcceptTimer} {(Math.round(gameAcceptTimer) === 1) ? "second" : "seconds"}</strong> since found, timing can adjust that with slider below.
                    </Alert>
                </Stack>
                <Stack>
                    <Slider onChange={handleTimerChange} onChangeCommitted={commitTimerChange} value={gameAcceptTimer} valueLabelDisplay="auto" step={1} marks min={0} max={12} />
                </Stack>

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
                                {dataTable}
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

