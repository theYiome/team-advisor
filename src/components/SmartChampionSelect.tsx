import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Box, Accordion, AccordionDetails, AccordionSummary, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { AlertDialog } from './common/AlertDialog';

import * as files from '../libs/files';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './common/CommonMessages';
import { ChampionSelectPhase, getChampionSelectState, hoverChampion, completeAction } from '../componentLibs/championSelect';
import { appInControl, banningMessage, inChampionSelectMessage, noInChampionSelectMessage, pickedMessage, pickingMessage, planningMessage, unknownMessage, userInControl } from './common/ChampionSelectMessages';

import { MultipleChampionPicker } from './common/ChampionRolePicker';

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


    // load setting from file
    useEffect(() => {
        files.loadJSON(filePath).then((settings) => {
            setSmartPickEnabled(settings.smartPickEnabled);
            setSmartBanEnabled(settings.smartBanEnabled);

            setBanList(settings.banList);
            setTopChampionList(settings.topChampionList);
            setJungleChampionList(settings.jungleChampionList);
            setMiddleChampionList(settings.middleChampionList);
            setBottomChampionList(settings.bottomChampionList);
            setSupportChampionList(settings.supportChampionList);

            setSettingsLoaded(true);
        }).catch(error => {
            console.warn(error);
            setSettingsLoaded(true);
        });
    }, [])

    // save settings to file when settings are updated
    useEffect(() => {
        const dataToSave = {
            smartPickEnabled,
            smartBanEnabled,
            banList,
            topChampionList,
            jungleChampionList,
            middleChampionList,
            bottomChampionList,
            supportChampionList
        }

        if (settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);

    }, [smartPickEnabled,
        smartBanEnabled,
        banList,
        topChampionList,
        jungleChampionList,
        middleChampionList,
        bottomChampionList,
        supportChampionList])

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
                const unavailableChampions = bans.concat(picks).concat(failedToHover).filter(unavailable => unavailable !== championId);

                const allPlayers = state.leftTeam.concat(state.rightTeam);

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
                    else
                        console.warn({ phase, message: "No champion matches criteria" });
                }

                // check if user made any action
                const controlTakenNow = lastChampionId !== championId && lastChampionId !== 0 && championId !== 0;
                if (controlTakenNow)
                    setUserTookControl(true);

                setLastChampionId(championId);
                console.log({ state, lastChampionId, championId, controlTakenNow, phase });

                if (!userTookControl && !controlTakenNow) {
                    // if control not taken app can perform an action
                    if (isInPickingPhase) {

                        const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                        const role = user.assignedPosition as string;

                        let championList: string[] = roleToChampionList[role];
                        if (!championList) {
                            console.warn("No assigned role!");
                            // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
                            championList = [].concat.apply([], Object.values(roleToChampionList));
                        }

                        const idChampionList = championList.map(name => parseInt(champions[name]));
                        const championToPick = idChampionList.find(pick => !unavailableChampions.includes(pick));

                        console.log({ allPlayers, user, role, championList, unavailableChampions, choosenChampion: championToPick });

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

                // next phase cleanup
                const idlePhases = [
                    ChampionSelectPhase.NoClient,
                    ChampionSelectPhase.NoInChampionSelect,
                    ChampionSelectPhase.InChampionSelect,
                    ChampionSelectPhase.Unknown
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
            setPeriodicUpdate(setInterval(updateFunction, 300));

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
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Container>
    );
}