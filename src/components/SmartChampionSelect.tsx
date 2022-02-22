import React, { useState, useContext, useMemo } from 'react';

import Container from '@mui/material/Container'
import { Button, Typography, Stack, Avatar, Skeleton, Grid, FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { defaultRoles } from './Settings/SettingsConstants';

import { ChampionsContext } from './ChampionProvider';

import { avatarURI } from '../componentLibs/leagueImages';
import { PickEntry } from './common/PickEntry';

import { useSnackbar } from 'notistack';

import { ClientStateContext } from './ClientState/ClientStateProvider';
import { ClientPhase } from './ClientState/ClientStateProviderLogic';
import { LolChampionSelectV1 } from './ClientState/ClientStateTypes';

const suggestionsEndpoints = {
    "default": "http://tomage.eu.pythonanywhere.com/team-advisor/",
    "strong": "http://tomage.eu.pythonanywhere.com/team-advisor/strong",
    "fit": "http://tomage.eu.pythonanywhere.com/team-advisor/fit"
};


export const SmartChampionSelect: React.FC = () => {

    const clientState = useContext(ClientStateContext);
    const { championIdToName, championNameToId, patch } = useContext(ChampionsContext);


    const [predictionEndpoint, setPredictionEndpoint] = useState("default");
    const [roleSwappedWith, setRoleSwaptWith] = useState("");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const predictions = clientState.predictions;
    const currentBans = clientState.bans;
    const leftTeam = clientState.leftTeam;
    const rightTeam = clientState.rightTeam;
    const localPlayerCellId = clientState.localPlayerCellId;
    const loadingPredictions = clientState.loadingPredictions;

    const canPick = [ClientPhase.Planning, ClientPhase.Picking, ClientPhase.InChampionSelect, ClientPhase.Banning].includes(clientState.phase);
    const canBan = [ClientPhase.Banning].includes(clientState.phase);

    const championNames = useMemo(() =>
        Object.keys(championNameToId),
        [championNameToId]
    );

    const roles = [...defaultRoles, ""];

    const avatarStyle = {
        boxShadow: 1,
        width: 48,
        height: 48,
    };

    const predictionsPlaceholder = useMemo(() => Array.from(Array(20).keys()).map(index =>
        <Grid key={index} item xs={"auto"}>
            <Skeleton
                key={index}
                variant="rectangular"
                sx={avatarStyle}
            />
        </Grid>
    ), []);

    const renderedPredictions = useMemo(() => predictions.map((prediction: number, index: number) =>
        <Grid key={prediction} item xs={"auto"}>
            <Button
                onClick={() => clientState.hoverChampion(prediction)}
                sx={{ '&:hover': { boxShadow: 6, transform: "scale(1.5)", zIndex: 10 }, m: 0, p: 0, minHeight: 0, minWidth: 0, transition: "all .1s ease-in-out" }}
                disabled={!canPick}
            >
                <Avatar
                    key={prediction}
                    src={avatarURI(patch, championIdToName[prediction])}
                    sx={{ ...avatarStyle, borderWidth: 2, borderStyle: "solid", borderColor: getColor(index / predictions.length), outlineWidth: 1, outlineStyle: "solid", outlineColor: "black" }}
                    variant='square'
                />
            </Button>
        </Grid>
    ), [predictions, canPick]);

    const bansPlaceholder = useMemo(() => Array.from(Array(10).keys()).map(index =>
        <Grid key={index} item xs={2} sm={1}>
            <Skeleton
                key={index}
                variant="rectangular"
                sx={avatarStyle}
            />
        </Grid>
    ), []);

    const renderedBans = useMemo(() => currentBans.map((ban: number, index: number) =>
        <Grid key={index} item xs={2} sm={1}>
            <Avatar
                key={index}
                src={avatarURI(patch, championIdToName[ban])}
                sx={avatarStyle}
                variant='rounded'
            />
        </Grid>
    ), [currentBans]);

    const picksPlaceholder = useMemo(() =>
        Array.from(Array(5).keys()).map(index => <Skeleton key={index} variant="rectangular" width="100%" height={128} sx={{ boxShadow: 5 }} />),
        []
    );

    const renderLeftTeam = useMemo(() => (
        leftTeam.length > 0 ?
            leftTeam.map(pick => <PickEntry
                key={pick.cellId}
                champions={championNames}
                championName={championIdToName[pick.championId ? pick.championId : pick.championPickIntent]}
                roleName={pick.assignedPosition}
                roles={roles}
                patch={patch}
                isPlayer={pick.cellId === localPlayerCellId}
                disabled
                reverse
            />) :
            picksPlaceholder
    ), [leftTeam]);

    const renderRightTeam = useMemo(() => (
        rightTeam.length > 0 ?
            rightTeam.map(pick => <PickEntry
                key={pick.cellId}
                champions={championNames}
                championName={championIdToName[pick.championId ? pick.championId : pick.championPickIntent]}
                roleName={pick.assignedPosition}
                roles={roles}
                patch={patch}
                isPlayer={pick.cellId === localPlayerCellId}
                disabled
            />) :
            picksPlaceholder
    ), [rightTeam]);

    return (
        <Container>
            <Stack spacing={3}>
                <Button variant="outlined" color='success' size="small" onClick={() => setDrawerOpen(true)}>
                    <SettingsIcon fontSize='small' sx={{ mr: 0.5 }}></SettingsIcon> SETTINGS
                </Button>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{ width: "100%" }}
                        onClick={() => clientState.getPredictions("http://tomage.eu.pythonanywhere.com/team-advisor/fit")}
                        size="small"
                        disabled={[ClientPhase.ClientClosed, ClientPhase.ClientOpen, ClientPhase.Unknown].includes(clientState.phase)}
                    >
                        MAKE PREDICTION
                    </Button>

                    <FormControl fullWidth size="small">
                        <InputLabel>Role swap</InputLabel>
                        <Select
                            value={roleSwappedWith}
                            label="Role swap"
                            onChange={(event: any) => {
                                const role: LolChampionSelectV1.Position = event.target.value;
                                setRoleSwaptWith(role);
                                clientState.setRoleSwap(role);
                            }}
                        >
                            <MenuItem value={""}>No swap</MenuItem>
                            <MenuItem value={"top"}>Top</MenuItem>
                            <MenuItem value={"jungle"}>Jungle</MenuItem>
                            <MenuItem value={"middle"}>Middle</MenuItem>
                            <MenuItem value={"bottom"}>Bottom</MenuItem>
                            <MenuItem value={"support"}>Support</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Suggestion type</InputLabel>
                        <Select
                            value={predictionEndpoint}
                            label="Suggestion type"
                            onChange={(event) => {
                                const endpoint = event.target.value as "default" | "strong" | "fit";
                                setPredictionEndpoint(endpoint);
                                // clientState.setPredictionsEndpoint(suggestionsEndpoints[endpoint]);
                            }}
                        >
                            <MenuItem value={"default"}>Default</MenuItem>
                            <MenuItem value={"strong"}>Prioritize winrate</MenuItem>
                            <MenuItem value={"fit"}>Prioritize matchups</MenuItem>
                        </Select>
                    </FormControl>

                </Stack>

                <Stack spacing={1}>
                    <Typography>
                        Suggested champions {canPick ? "- click to hover" : ""}
                        {loadingPredictions && <CircularProgress size={21} sx={{ mb: -0.5, ml: 1.2 }} disableShrink></CircularProgress>}
                    </Typography>
                    <Grid container columns={12} spacing={1}>
                        {predictions.length > 0 ? renderedPredictions : predictionsPlaceholder}
                    </Grid>

                    <Typography>Bans</Typography>

                    <Grid container columns={10} spacing={1}>
                        {currentBans.length > 0 ? renderedBans : bansPlaceholder}
                    </Grid>
                    <Typography>Picks</Typography>
                    <Stack direction="row" spacing={3}>
                        <Stack spacing={2} sx={{ width: 1 }}>
                            {renderLeftTeam}
                        </Stack>
                        <Stack spacing={2} sx={{ width: 1 }}>
                            {renderRightTeam}
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Container>
    );
}

// https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage/7128796
const getColor = (value: number) => {
    //value from 0 to 1
    const hue = ((1.0 - value) * 120).toString(10);
    const color = `hsl(${hue}, 100%, 45%)`;
    return color;
}

// const settingsDrawer = (
//     <Drawer
//         open={drawerOpen}
//         onClose={() => setDrawerOpen(false)}
//         elevation={6}
//     >
//         <Stack sx={{ mt: 4, p: 2 }} spacing={2} className={"scroll_enabled"}>
//             <FormControlLabel
//                 control={
//                     <Switch
//                         checked={smartBanEnabled}
//                         onChange={(event) => setSmartBanEnabled(event.target.checked)}
//                     />
//                 }
//                 label={<Typography>Smart Ban</Typography>}
//             />
//             <Alert severity="info">
//                 When banning phase starts,
//                 app will hover first champion from your list that is not <strong>already banned</strong> and
//                 is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally.

//                 <ul>
//                     <li>App will adjust this hover in real time.</li>
//                     <li>If no champion from your ban list matches criteria, nothing will be hovered.</li>
//                     <li>Hovering something by yourself takes control from the app.</li>
//                 </ul>
//             </Alert>

//             <FormControlLabel
//                 control={
//                     <Switch
//                         checked={smartPickEnabled}
//                         onChange={(event) => setSmartPickEnabled(event.target.checked)}
//                     />
//                 }
//                 label={<Typography>Smart Pick</Typography>}
//             />

//             <Alert severity="info">
//                 When your picking phase starts,
//                 app will hover first champion that <strong>you own</strong> from list for your <strong>current role</strong> that is not <strong>already banned</strong> and
//                 is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally and <strong>you own</strong>.
//                 It will also <strong>lock in</strong> any champion you hover when timer reaches zero.

//                 <ul>
//                     <li>App will adjust this hover if somebody picks your champion</li>
//                     <li>If no champion from your list matches criteria, nothing will be hovered.</li>
//                     <li>Auto lock in does not work in custom games.</li>
//                 </ul>
//             </Alert>

//             <Box sx={{ p: 2 }}>
//                 <Typography>Auto lockin timer adjustment (better leave as is, {defaultLockinAt.toFixed(1)} is recommended)</Typography>
//                 <Slider
//                     sx={{ width: "90%", ml: "5%" }}
//                     value={lockinAt}
//                     onChange={onLockinAtChange}
//                     marks={[{ value: 0, label: "Instant lockin" }, { value: 32, label: "To late" }]}
//                     min={0}
//                     max={40}
//                     step={0.5}
//                     valueLabelDisplay="auto"
//                 />
//             </Box>

//             <ErrorBoundary
//                 FallbackComponent={(error, resetErrorBoundary) => <Typography>Failed to load. Please restart the app: {error.error.message}</Typography>}
//                 onError={() => {
//                     setSmartBanEnabled(false);
//                     setSmartBanEnabled(false);
//                     setBanList([]);
//                     setTopChampionList([]);
//                     setBottomChampionList([]);
//                     setMiddleChampionList([]);
//                     setJungleChampionList([]);
//                     setSupportChampionList([]);
//                     setLockinAt(defaultLockinAt);
//                 }}
//             >

//                 <Stack spacing={2}>
//                     <Typography>
//                         Ban list
//                     </Typography>
//                     <MultipleChampionPicker
//                         championNames={championNames}
//                         currentList={banList}
//                         patch={patch}
//                         onChange={(newBanList) => setBanList(newBanList)}
//                         label="Ban list"
//                         variant="outlined"
//                     />
//                     <Typography>
//                         Champion lists
//                     </Typography>

//                     <Stack direction="row">
//                         <IconButton
//                             aria-label="Reset top to defaults"
//                             onClick={() => setTopChampionList(defaultChampionsForRole.top)}
//                         >
//                             <RestartAltIcon />
//                         </IconButton>

//                         <MultipleChampionPicker
//                             championNames={championNames}
//                             currentList={topChampionList}
//                             patch={patch}
//                             onChange={(newList) => setTopChampionList(newList)}
//                             label="Top"
//                         />
//                     </Stack>

//                     <Stack direction="row">
//                         <IconButton
//                             aria-label="Reset jungle to defaults"
//                             onClick={() => setJungleChampionList(defaultChampionsForRole.jungle)}
//                         >
//                             <RestartAltIcon />
//                         </IconButton>

//                         <MultipleChampionPicker
//                             championNames={championNames}
//                             currentList={jungleChampionList}
//                             patch={patch}
//                             onChange={(newList) => setJungleChampionList(newList)}
//                             label="Jungle"
//                         />
//                     </Stack>

//                     <Stack direction="row">
//                         <IconButton
//                             aria-label="Reset middle to defaults"
//                             onClick={() => setMiddleChampionList(defaultChampionsForRole.middle)}
//                         >
//                             <RestartAltIcon />
//                         </IconButton>

//                         <MultipleChampionPicker
//                             championNames={championNames}
//                             currentList={middleChampionList}
//                             patch={patch}
//                             onChange={(newList) => setMiddleChampionList(newList)}
//                             label="Middle"
//                         />
//                     </Stack>


//                     <Stack direction="row">
//                         <IconButton
//                             aria-label="Reset bottom to defaults"
//                             onClick={() => setBottomChampionList(defaultChampionsForRole.bottom)}>
//                             <RestartAltIcon />
//                         </IconButton>

//                         <MultipleChampionPicker
//                             championNames={championNames}
//                             currentList={bottomChampionList}
//                             patch={patch}
//                             onChange={(newList) => setBottomChampionList(newList)}
//                             label="Bottom"
//                         />
//                     </Stack>

//                     <Stack direction="row">
//                         <IconButton
//                             aria-label="Reset support to defaults"
//                             onClick={() => setSupportChampionList(defaultChampionsForRole.support)}>
//                             <RestartAltIcon />
//                         </IconButton>

//                         <MultipleChampionPicker
//                             championNames={championNames}
//                             currentList={supportChampionList}
//                             patch={patch}
//                             onChange={(newList) => setSupportChampionList(newList)}
//                             label="Support"
//                         />
//                     </Stack>
//                 </Stack>
//             </ErrorBoundary>
//         </Stack>
//     </Drawer>
// );