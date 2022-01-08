import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Box, Accordion, AccordionDetails, AccordionSummary, IconButton, LinearProgress, Avatar, CircularProgress, Skeleton, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { AlertDialog } from './common/AlertDialog';

import * as files from '../libs/files';
import * as connections from '../libs/connections'
import { defaultRoles, defaultChampionsForRole } from '../componentLibs/championSelectConstants';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './common/CommonMessages';
import { ChampionSelectPhase, getChampionSelectState, hoverChampion, completeAction } from '../componentLibs/championSelect';
import { appInControl, banningMessage, inChampionSelectMessage, noInChampionSelectMessage, pickedMessage, pickingMessage, planningMessage, unknownMessage, userInControl } from './common/ChampionSelectMessages';

import { MultipleChampionPicker } from './common/ChampionRolePicker';
import { ErrorBoundary } from 'react-error-boundary';
import { avatarURI } from '../componentLibs/leagueImages';
import { PickEntry } from './common/PickEntry';

const filePath = "settings/smartchampionselect.settings.json";

const compareTeams = (a: any[], b: any[]) => {
    return a.length === b.length && a.every((value, index) => (
        value.championId === b[index].championId &&
        value.championPickIntent === b[index].championPickIntent &&
        value.summonerId === b[index].summonerId &&
        value.assignedPosition === b[index].assignedPosition
    ));
};

const compareArrays = (a: any[], b: any[]) => a.length === b.length && a.every((value, index) => value === b[index]);

const offlinePhases = [
    ChampionSelectPhase.NoClient,
    ChampionSelectPhase.NoInChampionSelect,
    ChampionSelectPhase.Unknown
];

const idlePhases = [
    ...offlinePhases,
    ChampionSelectPhase.InChampionSelect
];


export const SmartChampionSelect: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);

    const [smartPickEnabled, setSmartPickEnabled] = useState(false);
    const [smartBanEnabled, setSmartBanEnabled] = useState(false);

    const verySlowUpdateInterval = 3000;
    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(verySlowUpdateInterval);

    const initialPhase = ChampionSelectPhase.Unknown;
    const [currentChampionSelectPhase, setCurrentChampionSelectPhase] = useState(initialPhase);

    // https://stackoverflow.com/questions/41632942/how-to-measure-time-elapsed-on-javascript
    const [championSelectActionStartTime, setChampionSelectActionStartTime] = useState(new Date());
    const elapsedTimeSinceLastAction = () => ((new Date() as any) - (championSelectActionStartTime as any)) / 1000;

    const [banList, setBanList] = useState(["Jax", "Viktor", "Lulu"]);

    const [topChampionList, setTopChampionList] = useState(defaultChampionsForRole.top);
    const [jungleChampionList, setJungleChampionList] = useState(defaultChampionsForRole.jungle);
    const [middleChampionList, setMiddleChampionList] = useState(defaultChampionsForRole.middle);
    const [bottomChampionList, setBottomChampionList] = useState(defaultChampionsForRole.bottom);
    const [supportChampionList, setSupportChampionList] = useState(defaultChampionsForRole.support);

    const defaultLockinAt = 30;
    const [lockinAt, setLockinAt] = useState(defaultLockinAt);

    const [failedToHover, setFailedToHover] = useState([]);

    const roleToChampionList: any = {
        "top": topChampionList,
        "jungle": jungleChampionList,
        "middle": middleChampionList,
        "bottom": bottomChampionList,
        "support": supportChampionList
    };

    const [lastChampionId, setLastChampionId] = useState(0);
    const [userTookControl, setUserTookControl] = useState(false);

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const [champions, setChampions] = useContext(ChampionsContext);

    const [leftTeam, setLeftTeam] = useState([]);
    const [rightTeam, setRightTeam] = useState([]);
    const [currentBans, setCurrentBans] = useState([]);
    const [localPlayerCellId, setLocalPlayerCellId] = useState(0);
    const [localPlayerTeamId, setLocalPlayerTeamId] = useState(0);

    const [preferredChampionList, setPreferredChampionList] = useState([]);

    const [predictions, setPredictions] = useState([]);


    const clearTeamState = () => {
        if (leftTeam.length > 0)
            setLeftTeam([]);
        if (rightTeam.length > 0)
            setRightTeam([]);
        if (currentBans.length > 0)
            setCurrentBans([]);
        if (predictions.length > 0)
            setPredictions([]);
        if (preferredChampionList.length > 0)
            setPreferredChampionList([]);
        if (localPlayerCellId !== 0)
            setLocalPlayerCellId(0);
        if (localPlayerTeamId !== 0)
            setLocalPlayerTeamId(0);
    }

    const getPredictions = async () => {
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: { leftTeam, rightTeam, bans: currentBans, localPlayerCellId, localPlayerTeamId, preferredChampionList },
            json: true
        }

        console.log(options);

        try {
            const response = await connections.fetchJSON("https://tomage.eu.pythonanywhere.com/team-advisor/", options);
            console.log({ response, options, type: typeof (response) });
            const content = response["sorted_champion_ids"];
            if (content)
                return content;
            else
                return [];
        }
        catch (error) {
            console.warn(error);
            return [];
        }
    }

    useEffect(() => {
        appRegainControl();
        setChampionSelectActionStartTime(new Date());

        if ([ChampionSelectPhase.Picking, ChampionSelectPhase.Banning].includes(currentChampionSelectPhase)) {
            if (failedToHover.length > 0)
                setFailedToHover([]);

            if (currentChampionSelectPhase === ChampionSelectPhase.Picking)
                getPredictions().then(newPredictions => setPredictions(newPredictions)).then(() => setLastChampionId(0));

            setUpdateInterval(250);
        }
        else if ([ChampionSelectPhase.InChampionSelect, ChampionSelectPhase.Planning, ChampionSelectPhase.Done].includes(currentChampionSelectPhase))
            setUpdateInterval(500);
        else {
            clearTeamState();
            setUpdateInterval(verySlowUpdateInterval);
        }
    }, [currentChampionSelectPhase])

    // load setting from file
    const loadSettings = () => {
        files.loadJSON(filePath).then((settings) => {
            setSmartPickEnabled(settings.smartPickEnabled);
            setSmartBanEnabled(settings.smartBanEnabled);

            setBanList(settings.banList);
            setTopChampionList(settings.topChampionList);
            setJungleChampionList(settings.jungleChampionList);
            setMiddleChampionList(settings.middleChampionList);
            setBottomChampionList(settings.bottomChampionList);
            setSupportChampionList(settings.supportChampionList);

            setLockinAt(settings.lockinAt);

            setSettingsLoaded(true);
        }).catch(error => {
            console.warn(error);
            setSettingsLoaded(true);
        });
    }

    useEffect(() => {
        loadSettings();
    }, [])

    const saveSettings = () => {
        const dataToSave = {
            smartPickEnabled,
            smartBanEnabled,
            banList,
            topChampionList,
            jungleChampionList,
            middleChampionList,
            bottomChampionList,
            supportChampionList,
            lockinAt
        }

        if (settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);
    }

    // save settings to file when settings are updated
    useEffect(
        () => saveSettings(),
        [
            smartPickEnabled,
            smartBanEnabled,
            banList,
            topChampionList,
            jungleChampionList,
            middleChampionList,
            bottomChampionList,
            supportChampionList,
            lockinAt
        ]
    );

    const appRegainControl = () => {
        if (userTookControl || lastChampionId !== 0) {
            setUserTookControl(false);
            setLastChampionId(0);
        }
    };

    const updateFunction = () => {

        // console.log("updateFunction");
        if (lockfileContent.port === "") {
            if (currentChampionSelectPhase !== ChampionSelectPhase.NoClient)
                setCurrentChampionSelectPhase(ChampionSelectPhase.NoClient);
            return;
        }

        getChampionSelectState(lockfileContent).then((state) => {

            const phase = state.phase;
            const isInPickingPhase = phase === ChampionSelectPhase.Picking;
            const isInBanningPhase = phase === ChampionSelectPhase.Banning;

            // lockin when reaches ~30 seconds in picking phase - draft only
            if (isInPickingPhase && state.isDraft && (elapsedTimeSinceLastAction() >= lockinAt) && (phase === currentChampionSelectPhase))
                completeAction(lockfileContent, state.actionId);

            if (phase !== currentChampionSelectPhase)
                setCurrentChampionSelectPhase(phase);

            // check if worth updating
            if (offlinePhases.includes(phase))
            return;

            const championId = state.championId;
            const picks = state.picks;
            const bans = state.bans;
            
            if(!compareArrays(bans, currentBans))
                setCurrentBans(bans);
            
            const unavailableChampions = bans.concat(picks).concat(failedToHover).filter(unavailable => unavailable !== championId);

            if (localPlayerCellId !== state.localPlayerCellId)
                setLocalPlayerCellId(state.localPlayerCellId);

            if (localPlayerTeamId !== state.localPlayerTeamId)
                setLocalPlayerTeamId(state.localPlayerTeamId);

            if (!compareTeams(state.leftTeam, leftTeam))
                setLeftTeam(state.leftTeam);
            if (!compareTeams(state.rightTeam, rightTeam))
                setRightTeam(state.rightTeam);

            const allPlayers = state.leftTeam.concat(state.rightTeam);
            const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
            const role = user ? user.assignedPosition : "";

            let preferredChampionList: string[] = roleToChampionList[role];
            if (!preferredChampionList) {
                console.warn("No assigned role!");
                console.warn({ user, role, allPlayers, roleToChampionList });
                // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
                preferredChampionList = [].concat.apply([], Object.values(roleToChampionList));
            }

            const newIdPreferredChampionList = preferredChampionList.map(name => parseInt(champions[name]));
            if (!compareArrays(preferredChampionList, newIdPreferredChampionList))
                setPreferredChampionList(newIdPreferredChampionList);


            const attemptToHover = (championIdToHover: number) => {
                if (championIdToHover && championIdToHover !== championId) {

                    if (lastChampionId !== championId)
                        setLastChampionId(championIdToHover);

                    hoverChampion(lockfileContent, state.actionId, championIdToHover).then((response: any) => {
                        if (response && response.errorCode)
                            setFailedToHover([...failedToHover, championIdToHover]);
                    });
                }
            }

            // check if user made any action
            const controlTakenNow = lastChampionId !== championId && lastChampionId !== 0 && championId !== 0;
            if (controlTakenNow)
                setUserTookControl(true);

            if (lastChampionId !== championId)
                setLastChampionId(championId);

            if (!userTookControl && !controlTakenNow) {
                // if control not taken app can perform an action
                if (isInPickingPhase) {
                    if (predictions.length > 0) {
                        const championToPick = predictions.find(pick => !unavailableChampions.includes(pick));

                        console.log({ allPlayers, user, role, championList: preferredChampionList, unavailableChampions, choosenChampion: championToPick });

                        attemptToHover(championToPick);
                    }
                }
                else if (isInBanningPhase) {
                    const idBanList = banList.map(name => parseInt(champions[name]));
                    const championToBan = idBanList.find(ban => !unavailableChampions.includes(ban));
                    attemptToHover(championToBan);
                }
            }

        });
    }


    // pooling client status
    useEffect(() => {
        updateFunction();

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (smartBanEnabled || smartPickEnabled)
            setPeriodicUpdate(setInterval(updateFunction, updateInterval));

        return () => clearInterval(periodicUpdate);

    }, [smartPickEnabled,
        smartBanEnabled,
        settingsLoaded,
        lastChampionId,
        lockfileContent,
        userTookControl,
        currentChampionSelectPhase,
        topChampionList,
        jungleChampionList,
        middleChampionList,
        bottomChampionList,
        supportChampionList,
        updateInterval]);

    // clearing state when turned off
    useEffect(() => {
        setChampionSelectActionStartTime(new Date());
        if (!smartPickEnabled && !smartBanEnabled)
            setCurrentChampionSelectPhase(initialPhase);
    }, [smartPickEnabled, smartBanEnabled]);

    let currentMessage = unknownMessage;
    switch (currentChampionSelectPhase) {
        case ChampionSelectPhase.NoClient: {
            currentMessage = noClientMessage;
            break;
        }
        case ChampionSelectPhase.NoInChampionSelect: {
            currentMessage = noInChampionSelectMessage;
            break;
        }
        case ChampionSelectPhase.InChampionSelect: {
            currentMessage = inChampionSelectMessage;
            break;
        }
        case ChampionSelectPhase.Planning: {
            currentMessage = planningMessage;
            break;
        }
        case ChampionSelectPhase.Banning: {
            currentMessage = banningMessage;
            break;
        }
        case ChampionSelectPhase.Picking: {
            currentMessage = pickingMessage();
            break;
        }
        case ChampionSelectPhase.Done: {
            currentMessage = pickedMessage;
            break;
        }
        case ChampionSelectPhase.Error: {
            currentMessage = errorStateMessage("Don't know what happened but it's not good! Maybe client isn't running?");
            break;
        }
    }

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).filter(key => key !== "0").map((goodKey: string) => champions[goodKey]).sort();
    const patch = champions["patch"];

    const championsWithEmpty = champions;
    championsWithEmpty[0] = "null";

    const championNamesWithEmpty = [...championNames, "null"];

    const controlMessage = userTookControl ? userInControl(appRegainControl) : appInControl;

    const roles = [...defaultRoles, ""];

    const predictionsPlaceholder = [0, 1, 2, 3, 4, 5, 6, 7].map(index => <Skeleton key={index} variant="circular" width={42} height={42} />);
    const bansPlaceholder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => <Skeleton key={index} variant="circular" width={42} height={42} />);
    const picksPlaceholder = [0, 1, 2, 3, 4].map(index => <Skeleton key={index} variant="rectangular" width="100%" height={128} />);

    const onLockinAtChange = (event: Event, newValue: number) => setLockinAt(newValue);

    return (
        <Container>
            <Stack spacing={3}>
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={10}>

                    <Stack direction="row">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={smartBanEnabled}
                                    onChange={(event) => setSmartBanEnabled(event.target.checked)}
                                />
                            }
                            label={<Typography>Smart Ban</Typography>}
                        />
                        <AlertDialog title="How does it work?">
                            <Typography>
                                When banning phase starts,
                                app will hover first champion from your list that is not <strong>already banned</strong> and
                                is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally.

                                <ul>
                                    <li>App will adjust this hover in real time.</li>
                                    <li>If no champion from your ban list matches criteria, nothing will be hovered.</li>
                                    <li>Hovering something by yourself takes control from the app.</li>
                                </ul>
                            </Typography>
                        </AlertDialog>
                    </Stack>

                    <Stack direction="row">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={smartPickEnabled}
                                    onChange={(event) => setSmartPickEnabled(event.target.checked)}
                                />
                            }
                            label={<Typography>Smart Pick</Typography>}
                        />
                        <AlertDialog title="How does it work?">
                            <Typography>
                                When your picking phase starts,
                                app will hover first champion that <strong>you own</strong> from list for your <strong>current role</strong> that is not <strong>already banned</strong> and
                                is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally and <strong>you own</strong>.<br /><br />
                                It will also <strong>lock in</strong> any champion you hover when timer reaches zero.

                                <ul>
                                    <li>App will adjust this hover in real time.</li>
                                    <li>If no champion from your list matches criteria, nothing will be hovered.</li>
                                    <li>Auto lock in does not work in custom games.</li>
                                    <li>Hovering something by yourself takes control from the app.</li>
                                </ul>
                            </Typography>
                        </AlertDialog>
                    </Stack>

                </Stack>

                {smartBanEnabled || smartPickEnabled ? (<Stack>{controlMessage}</Stack>) : ""}

                <Stack>
                    {currentMessage}
                </Stack>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            Settings
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ErrorBoundary
                            FallbackComponent={(error, resetErrorBoundary) => <Typography>Failed to load. Please restart the app: {error.error.message}</Typography>}
                            onError={() => {
                                setSmartBanEnabled(false);
                                setSmartBanEnabled(false);
                                setBanList([]);
                                setTopChampionList([]);
                                setBottomChampionList([]);
                                setMiddleChampionList([]);
                                setJungleChampionList([]);
                                setSupportChampionList([]);
                                setLockinAt(defaultLockinAt);
                            }}
                        >

                            <Stack spacing={2}>
                                <Typography>
                                    Ban list
                                </Typography>
                                <MultipleChampionPicker
                                    championNames={championNames}
                                    currentList={banList}
                                    patch={patch}
                                    onChange={(newBanList) => setBanList(newBanList)}
                                    label="Ban list"
                                    variant="outlined"
                                />
                                <Typography>
                                    Champion lists
                                </Typography>

                                <Stack direction="row">
                                    <IconButton
                                        aria-label="Reset top to defaults"
                                        onClick={() => setTopChampionList(defaultChampionsForRole.top)}
                                    >
                                        <RestartAltIcon />
                                    </IconButton>

                                    <MultipleChampionPicker
                                        championNames={championNames}
                                        currentList={topChampionList}
                                        patch={patch}
                                        onChange={(newList) => setTopChampionList(newList)}
                                        label="Top"
                                    />
                                </Stack>

                                <Stack direction="row">
                                    <IconButton
                                        aria-label="Reset jungle to defaults"
                                        onClick={() => setJungleChampionList(defaultChampionsForRole.jungle)}
                                    >
                                        <RestartAltIcon />
                                    </IconButton>

                                    <MultipleChampionPicker
                                        championNames={championNames}
                                        currentList={jungleChampionList}
                                        patch={patch}
                                        onChange={(newList) => setJungleChampionList(newList)}
                                        label="Jungle"
                                    />
                                </Stack>

                                <Stack direction="row">
                                    <IconButton
                                        aria-label="Reset middle to defaults"
                                        onClick={() => setMiddleChampionList(defaultChampionsForRole.middle)}
                                    >
                                        <RestartAltIcon />
                                    </IconButton>

                                    <MultipleChampionPicker
                                        championNames={championNames}
                                        currentList={middleChampionList}
                                        patch={patch}
                                        onChange={(newList) => setMiddleChampionList(newList)}
                                        label="Middle"
                                    />
                                </Stack>


                                <Stack direction="row">
                                    <IconButton
                                        aria-label="Reset bottom to defaults"
                                        onClick={() => setBottomChampionList(defaultChampionsForRole.bottom)}>
                                        <RestartAltIcon />
                                    </IconButton>

                                    <MultipleChampionPicker
                                        championNames={championNames}
                                        currentList={bottomChampionList}
                                        patch={patch}
                                        onChange={(newList) => setBottomChampionList(newList)}
                                        label="Bottom"
                                    />
                                </Stack>

                                <Stack direction="row">
                                    <IconButton
                                        aria-label="Reset support to defaults"
                                        onClick={() => setSupportChampionList(defaultChampionsForRole.support)}>
                                        <RestartAltIcon />
                                    </IconButton>

                                    <MultipleChampionPicker
                                        championNames={championNames}
                                        currentList={supportChampionList}
                                        patch={patch}
                                        onChange={(newList) => setSupportChampionList(newList)}
                                        label="Support"
                                    />
                                </Stack>

                                <Container sx={{ p: 2 }}>
                                    <Typography>Auto lockin timer adjustment (better leave as is, {defaultLockinAt.toFixed(1)} is recommended)</Typography>
                                    <Slider
                                        sx={{ width: "90%", ml: "5%" }}
                                        value={lockinAt}
                                        onChange={onLockinAtChange}
                                        marks={[{ value: 0, label: "Instant lockin" }, { value: 31, label: "To late" }]}
                                        min={0}
                                        max={40}
                                        step={0.5}
                                        valueLabelDisplay="auto"
                                    />
                                </Container>
                            </Stack>
                        </ErrorBoundary>
                    </AccordionDetails>
                </Accordion>

                <Typography variant="h6">Pick suggestions</Typography>
                <Button
                    variant="contained"
                    onClick={() => getPredictions().then(newPredictions => setPredictions(newPredictions))}>
                    MAKE PREDICTION
                </Button>
                <Grid container spacing={1}>
                    {
                        predictions.length > 0 ?
                            predictions.map((prediction, index) => 
                            <Grid key={prediction} item xs={1}>
                                <Avatar
                                    key={prediction}
                                    alt={champions[prediction]}
                                    src={avatarURI(patch, champions[prediction])}
                                    sx={{ boxShadow: 5, backgroundColor: "white", width: 42, height: 42 }}
                                    variant='rounded'
                                />
                            </Grid>) :
                            predictionsPlaceholder
                    }
                </Grid>
                <Stack spacing={2}>
                    <Typography>Bans</Typography>
                    <Stack direction="row" spacing={2} justifyContent="flex-start" alignItems="flex-start" sx={{ flexWrap: "wrap" }}>
                        {
                            currentBans.length > 0 ?
                                currentBans.map((ban, index) => <Avatar
                                    key={index}
                                    alt={champions[ban]}
                                    src={avatarURI(patch, champions[ban])}
                                    sx={{ boxShadow: 5, backgroundColor: "white", width: 42, height: 42 }}
                                    variant='rounded'
                                />) :
                                bansPlaceholder
                        }
                    </Stack>

                    <Typography>Picks</Typography>
                    <Stack direction="row" spacing={3}>
                        <Stack spacing={2} sx={{ width: 1 }}>
                            {
                                leftTeam.length > 0 ?
                                    leftTeam.map(pick => <PickEntry
                                        key={pick.cellId}
                                        champions={championNamesWithEmpty}
                                        championName={championsWithEmpty[pick.championId ? pick.championId : pick.championPickIntent]}
                                        roleName={pick.assignedPosition}
                                        roles={roles}
                                        patch={patch}
                                        isPlayer={pick.cellId === localPlayerCellId}
                                        disabled
                                        reverse
                                    />) :
                                    picksPlaceholder
                            }
                        </Stack>
                        <Stack spacing={2} sx={{ width: 1 }}>
                            {
                                rightTeam.length > 0 ?
                                    rightTeam.map(pick => <PickEntry
                                        key={pick.cellId}
                                        champions={championNamesWithEmpty}
                                        championName={championsWithEmpty[pick.championId ? pick.championId : pick.championPickIntent]}
                                        roleName={pick.assignedPosition}
                                        roles={roles}
                                        patch={patch}
                                        isPlayer={pick.cellId === localPlayerCellId}
                                        disabled
                                    />) :
                                    picksPlaceholder
                            }
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Container>
    );
}