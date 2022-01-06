import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Box, Accordion, AccordionDetails, AccordionSummary, IconButton, LinearProgress, Avatar, CircularProgress, Skeleton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { AlertDialog } from './common/AlertDialog';

import * as files from '../libs/files';

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

export const SmartChampionSelect: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);

    const [smartPickEnabled, setSmartPickEnabled] = useState(false);
    const [smartBanEnabled, setSmartBanEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);

    const initialPhase = ChampionSelectPhase.Unknown;
    const [championSelectPhase, setChampionSelectPhase] = useState(initialPhase);

    // https://stackoverflow.com/questions/41632942/how-to-measure-time-elapsed-on-javascript
    const [championSelectActionStartTime, setChampionSelectActionStartTime] = useState(new Date());
    const [championSelectActionElapsedTime, setChampionSelectActionElapsedTime] = useState(-1);
    const elapsedTimeSinceLastAction = () => ((new Date() as any) - (championSelectActionStartTime as any)) / 1000;

    const [banList, setBanList] = useState(["Jax", "Viktor", "Kassadin"]);

    const [topChampionList, setTopChampionList] = useState(["DrMundo", "Shen"]);
    const [jungleChampionList, setJungleChampionList] = useState(["Nunu", "Zac"]);
    const [middleChampionList, setMiddleChampionList] = useState(["Viktor", "Zed"]);
    const [bottomChampionList, setBottomChampionList] = useState(["Jinx", "Jhin"]);
    const [supportChampionList, setSupportChampionList] = useState(["Pyke", "Thresh"]);

    const [lockinAt, setLockinAt] = useState(29.5);

    const [failedToHover, setFailedToHover] = useState([]);

    const roleToChampionList: any = {
        "top": topChampionList,
        "jungle": jungleChampionList,
        "middle": middleChampionList,
        "bottom": bottomChampionList,
        "utility": supportChampionList
    };

    const [lastChampionId, setLastChampionId] = useState(0);
    const [userTookControl, setUserTookControl] = useState(false);

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const [champions, setChampions] = useContext(ChampionsContext);
    
    const [leftTeam, setLeftTeam] = useState([]);
    const [rightTeam, setRightTeam] = useState([]);
    const [bans, setBans] = useState([]);
    const [localPlayerCellId, setLocalPlayerCellId] = useState(0);
    const [localPlayerTeamId, setLocalPlayerTeamId] = useState(0);

    const [preferredChampionList, setPreferredChampionList] = useState([]);

    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        // console.log({leftTeam, rightTeam, bans, localPlayerCellId, localPlayerTeamId, preferredChampionList});
    }, [leftTeam, rightTeam, bans, localPlayerCellId, localPlayerTeamId, preferredChampionList])

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
    useEffect(() => {

        saveSettings();

    }, [smartPickEnabled,
        smartBanEnabled,
        banList,
        topChampionList,
        jungleChampionList,
        middleChampionList,
        bottomChampionList,
        supportChampionList,
        lockinAt])

    const regainConctrol = () => {
        setUserTookControl(false);
        setLastChampionId(0);
    };

    // pooling client status
    useEffect(() => {

        const updateFunction = () => {

            if (lockfileContent.port === "") {
                setChampionSelectPhase(ChampionSelectPhase.NoClient);
                return;
            }

            getChampionSelectState(lockfileContent).then((state) => {

                const phase = state.phase;
                setChampionSelectPhase(phase);
                setChampionSelectActionElapsedTime(elapsedTimeSinceLastAction());

                const championId = state.championId;
                const picks = state.picks;

                const bans = state.bans;
                setBans(bans);
                
                const unavailableChampions = bans.concat(picks).concat(failedToHover).filter(unavailable => unavailable !== championId);
                
                setLocalPlayerCellId(state.localPlayerCellId);
                setLocalPlayerTeamId(state.localPlayerTeamId);

                const allPlayers = state.leftTeam.concat(state.rightTeam);
                
                setLeftTeam(state.leftTeam);
                setRightTeam(state.rightTeam);
                
                const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                const role = user ? user.assignedPosition as string : "";

                let preferredChampionList: string[] = roleToChampionList[role];
                if (!preferredChampionList) {
                    // console.warn("No assigned role!");
                    // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
                    preferredChampionList = [].concat.apply([], Object.values(roleToChampionList));
                }

                const idPreferredChampionList = preferredChampionList.map(name => parseInt(champions[name]));
                setPreferredChampionList(idPreferredChampionList);

                const isInPickingPhase = phase === ChampionSelectPhase.Picking;
                const isInBanningPhase = phase === ChampionSelectPhase.Banning;

                const attemptToHover = (championIdToHover: number) => {
                    if (championIdToHover && championIdToHover !== championId) {
                        setLastChampionId(championIdToHover);
                        hoverChampion(lockfileContent, state.actionId, championIdToHover).then((response: any) => {
                            try {
                                if (response["errorCode"])
                                    setFailedToHover([...failedToHover, championIdToHover]);
                            } catch (error) { console.warn(error); }
                        });
                    }
                }

                // check if user made any action
                const controlTakenNow = lastChampionId !== championId && lastChampionId !== 0 && championId !== 0;
                if (controlTakenNow)
                    setUserTookControl(true);

                setLastChampionId(championId);

                if (!userTookControl && !controlTakenNow) {
                    // if control not taken app can perform an action
                    if (isInPickingPhase) {
                        const championToPick = idPreferredChampionList.find(pick => !unavailableChampions.includes(pick));

                        console.log({ allPlayers, user, role, championList: preferredChampionList, unavailableChampions, choosenChampion: championToPick });

                        attemptToHover(championToPick);
                    }
                    else if (isInBanningPhase) {
                        const idBanList = banList.map(name => parseInt(champions[name]));
                        const championToBan = idBanList.find(ban => !unavailableChampions.includes(ban));
                        attemptToHover(championToBan);
                    }
                }

                // lockin when reaches 30 seconds in picking phase - draft only
                if (isInPickingPhase && state.isDraft && (elapsedTimeSinceLastAction() >= lockinAt))
                    completeAction(lockfileContent, state.actionId);

                const offlinePhases = [
                    ChampionSelectPhase.NoClient,
                    ChampionSelectPhase.NoInChampionSelect,
                    ChampionSelectPhase.Unknown
                ];

                // next phase cleanup
                const idlePhases = [
                    ...offlinePhases,
                    ChampionSelectPhase.InChampionSelect
                ];

                if (idlePhases.includes(phase) || championSelectPhase !== phase) {
                    regainConctrol();
                    setChampionSelectActionStartTime(new Date());
                    setFailedToHover([]);
                }
            });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (smartPickEnabled || smartBanEnabled)
            setPeriodicUpdate(setInterval(updateFunction, 350));

        return () => clearInterval(periodicUpdate);

    }, [smartPickEnabled,
        smartBanEnabled,
        lockfileContent,
        settingsLoaded,
        userTookControl,
        lastChampionId,
        championSelectPhase]);

    // clearing state when turned off
    useEffect(() => {
        setChampionSelectActionStartTime(new Date());
        if (!smartPickEnabled && !smartBanEnabled)
            setChampionSelectPhase(initialPhase);
    }, [smartPickEnabled, smartBanEnabled]);

    let currentMessage = unknownMessage;

    switch (championSelectPhase) {
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
            currentMessage = pickingMessage((lockinAt - championSelectActionElapsedTime).toFixed(1));
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

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();

    const patch = champions["patch"];

    const controlMessage = userTookControl ? userInControl(regainConctrol) : appInControl;

    const smartBanLabel = (<Typography>Smart Ban</Typography>);

    const smartPickLabel = (<Typography>Smart Pick</Typography>);

    const roles = ["top", "jungle", "middle", "bottom", "support", ""];

    const predictionsPlaceholder = [0, 1, 2, 3, 4, 5, 6, 7].map(index => <Skeleton key={index} variant="circular" width={42} height={42}/>);
    const bansPlaceholder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => <Skeleton key={index} variant="circular" width={42} height={42}/>);
    const picksPlaceholder = [0, 1, 2, 3, 4].map(index => <Skeleton key={index} variant="rectangular" width="100%" height={128} />);

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
                            label={smartBanLabel}
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
                            label={smartPickLabel}
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
                                setLockinAt(29.5);
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
                                <MultipleChampionPicker
                                    championNames={championNames}
                                    currentList={topChampionList}
                                    patch={patch}
                                    onChange={(newList) => setTopChampionList(newList)}
                                    label="Top"
                                />
                                <MultipleChampionPicker
                                    championNames={championNames}
                                    currentList={jungleChampionList}
                                    patch={patch}
                                    onChange={(newList) => setJungleChampionList(newList)}
                                    label="Jungle"
                                />
                                <MultipleChampionPicker
                                    championNames={championNames}
                                    currentList={middleChampionList}
                                    patch={patch}
                                    onChange={(newList) => setMiddleChampionList(newList)}
                                    label="Middle"
                                />
                                <MultipleChampionPicker
                                    championNames={championNames}
                                    currentList={bottomChampionList}
                                    patch={patch}
                                    onChange={(newList) => setBottomChampionList(newList)}
                                    label="Bottom"
                                />
                                <MultipleChampionPicker
                                    championNames={championNames}
                                    currentList={supportChampionList}
                                    patch={patch}
                                    onChange={(newList) => setSupportChampionList(newList)}
                                    label="Support"
                                />
                                <Container sx={{ p: 2}}>
                                    <Typography>Auto lockin timer adjustment (better leave as is, 29.5 is recommended)</Typography>
                                    <Slider
                                        sx={{ width: "90%", ml: "5%" }}
                                        value={lockinAt}
                                        onChange={(event: Event, newValue: number) => setLockinAt(newValue)}
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
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                    {
                        predictions.length > 0 ? 
                        predictions.map(ban => <Avatar 
                            key={ban}
                            alt={champions[ban]} 
                            src={avatarURI(patch, champions[ban])}
                            sx={{boxShadow: 5, backgroundColor: "white", width: 42, height: 42}}
                        />) :
                        predictionsPlaceholder
                    }
                </Stack>
                <Stack spacing={2}>
                    <Typography>Bans</Typography>
                    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        {
                            bans.length > 0 ? 
                            bans.map((ban, index) => <Avatar 
                                key={index}
                                alt={champions[ban]} 
                                src={avatarURI(patch, champions[ban])}
                                sx={{boxShadow: 5, backgroundColor: "white", width: 42, height: 42}}
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
                                    champions={championNames}
                                    championName={champions[pick.championId ? pick.championId : pick.championPickIntent]} 
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
                                    champions={championNames}
                                    championName={champions[pick.championId ? pick.championId : pick.championPickIntent]} 
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