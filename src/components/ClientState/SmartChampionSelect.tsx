import React, { useState, useContext, useMemo, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, Typography, Stack, Avatar, Skeleton, Grid, FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@mui/material';

import { defaultRoles } from '../Settings/SettingsConstants';

import { ChampionsContext } from '../Champions/ChampionProvider';

import { avatarURI } from '../../componentLibs/leagueImages';
import { PickEntry } from '../common/PickEntry';

import { useSnackbar } from 'notistack';

import { ClientStateContext } from './ClientStateProvider';
import { ClientPhase } from './ClientStateProviderLogic';
import { LolChampionSelectV1 } from './ClientStateTypes';
import { PredictionEndpoint, SettingsActionType, SettingsContext } from '../Settings/SettingsProvider';

export const SmartChampionSelect: React.FC = () => {

    const clientState = useContext(ClientStateContext);
    const { championIdToName, championNameToId, patch } = useContext(ChampionsContext);

    const {settings, settingsDispatch} = useContext(SettingsContext);
    const [roleSwappedWith, setRoleSwaptWith] = useState("");

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const predictions = clientState.predictions;
    const currentBans = clientState.bans;
    const leftTeam = clientState.leftTeam;
    const rightTeam = clientState.rightTeam;
    const localPlayerCellId = clientState.localPlayerCellId;
    const loadingPredictions = clientState.loadingPredictions;

    const canPick = [ClientPhase.Planning, ClientPhase.Picking, ClientPhase.InChampionSelect, ClientPhase.Banning].includes(clientState.phase);
    const canBan = [ClientPhase.Banning].includes(clientState.phase);

    useEffect(() => {
        if (clientState.userTookControl && [ClientPhase.InChampionSelect, ClientPhase.Planning, ClientPhase.Picking].includes(clientState.phase))
            enqueueSnackbar("You hovered something in client - picking from app will be disabled in this champion select", {variant: "error"});
    }, [clientState.userTookControl]);

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

    const renderedPredictions = predictions.map((prediction: number, index: number) =>
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
    );

    const bansPlaceholder = useMemo(() => Array.from(Array(10).keys()).map(index =>
        <Grid key={index} item md={2} lg={1}>
            <Skeleton
                key={index}
                variant="rectangular"
                sx={avatarStyle}
            />
        </Grid>
    ), []);

    const renderedBans = useMemo(() => currentBans.map((ban: number, index: number) =>
        <Grid key={index} item md={2} lg={1}>
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
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{ width: "100%" }}
                        onClick={() => clientState.getPredictions()}
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
                            value={settings.predictionEndpoint}
                            label="Suggestion type"
                            onChange={(event) => {
                                const endpoint = event.target.value as PredictionEndpoint;
                                settingsDispatch({ type: SettingsActionType.SetPredictionEndpoint, payload: endpoint });
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
    // value from 0 to 1
    const hue = ((1.0 - value) * 120).toString(10);
    const color = `hsl(${hue}, 100%, 45%)`;
    return color;
}