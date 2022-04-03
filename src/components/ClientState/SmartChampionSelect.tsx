import React, { useState, useContext, useMemo, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, Typography, Stack, Avatar, Skeleton, Grid, FormControl, InputLabel, MenuItem, Select, CircularProgress, Tooltip, Box, Badge, Divider, Chip } from '@mui/material';

import { ChampionsContext } from '../Champions/ChampionProvider';

import { avatarURI } from '../../componentLibs/leagueImages';

import { useSnackbar } from 'notistack';

import { ClientStateContext } from './ClientStateProvider';
import { ClientPhase } from './ClientStateProviderLogic';
import { LolChampionSelectV1 } from './ClientStateTypes';
import { PredictionEndpoint, SettingsActionType, SettingsContext } from '../Settings/SettingsProvider';
import { SimplePickEntry } from '../common/SimplePickEntry';
import { Prediction } from '../Predictions/PredictionsAPI';
import { FavouritesContext } from '../Favourites/FavouritesProvider';

export const SmartChampionSelect: React.FC = () => {

    const clientState = useContext(ClientStateContext);
    const { championIdToName, championNameToId, patch } = useContext(ChampionsContext);

    const { settings, settingsDispatch } = useContext(SettingsContext);
    const { favourites } = useContext(FavouritesContext);
    const [roleSwappedWith, setRoleSwaptWith] = useState(LolChampionSelectV1.Position.None);

    const { enqueueSnackbar } = useSnackbar();

    const predictions = clientState.predictions;
    const currentBans = clientState.bans;
    const leftTeam = clientState.leftTeam;
    const rightTeam = clientState.rightTeam;
    const localPlayerCellId = clientState.localPlayerCellId;
    const loadingPredictions = clientState.loadingPredictions;

    // get flat list of chamipionId from leftTeam and rightTeam
    const pickedChampionIds = useMemo(() => {
        const leftTeamChampionIds = leftTeam.map(player => player.championId);
        const rightTeamChampionIds = rightTeam.map(player => player.championId);
        return [...leftTeamChampionIds, ...rightTeamChampionIds];
    }, [leftTeam, rightTeam]);

    const canPick = useMemo(() => [ClientPhase.Planning, ClientPhase.Picking, ClientPhase.InChampionSelect].includes(clientState.phase), [clientState.phase]);

    // get assignedPosition for player with localPlayerCellId from leftTeam and rightTeam
    const assignedPosition = useMemo(() => {
        if (roleSwappedWith === LolChampionSelectV1.Position.None) {
            const leftTeamAssignedPosition = leftTeam.find(player => player.cellId === localPlayerCellId)?.assignedPosition;
            const rightTeamAssignedPosition = rightTeam.find(player => player.cellId === localPlayerCellId)?.assignedPosition;
            return leftTeamAssignedPosition || rightTeamAssignedPosition || LolChampionSelectV1.Position.None;
        } 
        else
            return roleSwappedWith;
    }, [leftTeam, rightTeam, localPlayerCellId, roleSwappedWith]);

    // get favourites for assignedPosition
    const currentFavourites = useMemo(() => favourites[assignedPosition].map(fav => championNameToId[fav]), [favourites, assignedPosition]);

    useEffect(() => {
        if (clientState.userTookControl)
            enqueueSnackbar("You hovered something in client - picking from app will be disabled in this champion select", { variant: "error" });
    }, [clientState.userTookControl]);

    const avatarStyle = {
        width: settings.championAvatarSize,
        height: settings.championAvatarSize,
    };
    
    const predictionStyle = {
        boxShadow: 2,
        borderWidth: 3,
        borderStyle: "solid",
        outlineWidth: 1,
        outlineStyle: "solid",
        outlineColor: "black"
    };

    const predictionsPlaceholder = useMemo(() => Array.from(Array(10).keys()).map(index =>
        <Grid key={index} item xs={"auto"}>
            <Skeleton
                key={index}
                variant="rectangular"
                sx={avatarStyle}
            />
        </Grid>
    ), [settings.championAvatarSize]);


    const predictionsToGrid = (prediction: Prediction) => {
        const isAvailable = !clientState.userTookControl && !clientState.bans.includes(prediction.championId) && !pickedChampionIds.includes(prediction.championId);
        const isHighestTier = prediction.tier === predictions.tierCount - 1;
        const color = getColorForTier(prediction.tier, predictions.tierCount);

        return (<Grid key={prediction.championId} item xs={"auto"}>
            <Tooltip title={`Score: ${prediction.score}`} followCursor placement='top'>
                <Box>
                    <Button
                        onClick={() => clientState.hoverChampion(prediction.championId)}
                        sx={{ '&:hover': { boxShadow: 6, transform: "scale(1.5)", zIndex: 10 }, m: 0, p: 0, minHeight: 0, minWidth: 0, transition: "all .12s ease-in-out" }}
                        disabled={!canPick || !isAvailable}
                    >
                        <Badge badgeContent={isHighestTier ? "OP" : 0} color="primary">
                            <Box sx={{ ...predictionStyle, borderColor: color}}>
                                <Avatar
                                    key={prediction.championId}
                                    src={avatarURI(patch, championIdToName[prediction.championId])}
                                    sx={{ ...avatarStyle, filter: isAvailable ? "none" : "grayscale(100%)"}}
                                    variant='square'
                                />
                            </Box>
                        </Badge>
                    </Button>
                </Box>
            </Tooltip>
        </Grid>)
    }
        

    // https://github.com/mui/material-ui/issues/8416
    const comparePredictions = (a: Prediction, b: Prediction) => b.score - a.score;
    const renderedPredictions = predictions ? predictions.predictions.filter(p => !currentFavourites.includes(p.championId)).sort(comparePredictions).map(predictionsToGrid) : predictionsPlaceholder;
    const renderedFavourites = (currentFavourites.length > 0 && predictions) ? predictions.predictions.filter(p => currentFavourites.includes(p.championId)).sort(comparePredictions).map(predictionsToGrid) : predictionsPlaceholder;

    const bansPlaceholder = useMemo(() => Array.from(Array(10).keys()).map(index =>
        <Grid key={index} item>
            <Skeleton
                key={index}
                variant="rectangular"
                sx={avatarStyle}
            />
        </Grid>
    ), [settings.championAvatarSize]);

    const renderedBans = useMemo(() => currentBans.map((ban: number, index: number) =>
        <Grid key={index} item>
            <Avatar
                key={index}
                src={avatarURI(patch, championIdToName[ban])}
                sx={avatarStyle}
                variant='rounded'
            />
        </Grid>
    ), [currentBans, settings.championAvatarSize]);

    const picksPlaceholder = useMemo(() =>
        Array.from(Array(5).keys()).map(index => <Skeleton key={index} variant="rectangular" width="100%" height={128} sx={{ boxShadow: 5 }} />),
        []
    );

    const getPickEntryVariant = (team: LolChampionSelectV1.Team[], localPlayerCellId: number, cellId: number) => {
        if (team.some(cell => cell.cellId === localPlayerCellId)) {
            if (localPlayerCellId === cellId)
                return "player";
            else
                return "allay";
        }
        else
            return "enemy";
    };

    const sortByRole = (a: LolChampionSelectV1.Team, b: LolChampionSelectV1.Team) => {
        const roleValues = {
            "top": 5,
            "jungle": 4,
            "middle": 3,
            "bottom": 2,
            "support": 1,
            "utility": 1,
            "": 0
        };
        return roleValues[b.assignedPosition] - roleValues[a.assignedPosition]
    };

    const renderLeftTeam = useMemo(() => (
        <Stack direction="row" spacing={1} justifyContent="center">
            {
                leftTeam.length > 0 ?
                    leftTeam.sort(sortByRole).map(pick => <SimplePickEntry
                        key={pick.cellId}
                        champion={championIdToName[pick.championId ? pick.championId : pick.championPickIntent]}
                        role={pick.assignedPosition}
                        patch={patch}
                        variant={getPickEntryVariant(leftTeam, localPlayerCellId, pick.cellId)}
                    />) :
                    picksPlaceholder
            }
        </Stack>
    ), [leftTeam]);

    const renderRightTeam = useMemo(() => (
        <Stack direction="row" spacing={1} justifyContent="center">
            {
                rightTeam.length > 0 ?
                    rightTeam.sort(sortByRole).map(pick => <SimplePickEntry
                        key={pick.cellId}
                        champion={championIdToName[pick.championId ? pick.championId : pick.championPickIntent]}
                        role={pick.assignedPosition}
                        patch={patch}
                        variant={getPickEntryVariant(rightTeam, localPlayerCellId, pick.cellId)}
                    />) :
                    picksPlaceholder
            }
        </Stack>
    ), [rightTeam]);

    return (
        <Container>
            <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
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
                </Stack>

                <Stack spacing={1}>
                    <Typography>
                        Pick suggestions {canPick ? "- click to hover" : ""}
                        {loadingPredictions && <CircularProgress size={21} sx={{ mb: -0.5, ml: 1.2 }} disableShrink></CircularProgress>}
                    </Typography>

                    <Grid container columns={12} spacing={1}>
                        {renderedPredictions}
                    </Grid>

                    <Divider>
                        <Chip label="Favourites" color='primary'/>
                    </Divider>

                    <Grid container columns={12} spacing={1}>
                        {renderedFavourites}
                    </Grid>

                    <Typography>Bans</Typography>
                    <Grid container columns={10} spacing={1}>
                        {currentBans.length > 0 ? renderedBans : bansPlaceholder}
                    </Grid>

                    <Typography>Picks</Typography>
                    <Grid container spacing={1.2}>
                        <Grid item md={12} lg={6}>
                            {renderLeftTeam}
                        </Grid>
                        <Grid item md={12} lg={6}>
                            {renderRightTeam}
                        </Grid>
                    </Grid>
                </Stack>
            </Stack>
        </Container>
    );
}

// https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage/7128796
const getColor = (value: number) => {
    // value from 0 to 1
    const hue = ((1.0 - value) * 200).toString(10);
    const color = `hsl(${hue}, 95%, 40%)`;
    return color;
}


const getColorForTier = (tier: number, tierCount: number) => {
    if (tier === tierCount - 1)
        return "#E0E";
    else if (tier === 0)
        return "#111";
    else {
        const value = (tier - 1.0) / (tierCount - 3.0);
        return getColor(1.0 - value);
    }
}