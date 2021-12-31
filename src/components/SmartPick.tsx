import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


import * as files from '../libs/files';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './common/CommonMessages';
import { ChampionSelectPhase, getChampionSelectState, hoverChampion } from '../componentLibs/championSelect';
import { appInControl, banningMessage, inChampionSelectMessage, noInChampionSelectMessage, pickedMessage, pickingMessage, planningMessage, unknownMessage, userInControl } from './common/ChampionSelectMessages';

import { MultipleChampionPicker } from './common/ChampionRolePicker';

const filePath = "settings/smartpick.settings.json";

export const SmartPick: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);

    const initialPhase = ChampionSelectPhase.Unknown;

    const [championSelectPhase, setChampionSelectPhase] = useState(initialPhase);

    const [topChampionList, setTopChampionList] = useState(["DrMundo", "Shen"]);
    const [jungleChampionList, setJungleChampionList] = useState(["Nunu", "Zac"]);
    const [middleChampionList, setMiddleChampionList] = useState(["Viktor", "Zed"]);
    const [bottomChampionList, setBottomChampionList] = useState(["Jinx", "Jhin"]);
    const [supportChampionList, setSupportChampionList] = useState(["Pyke", "Thresh"]);

    const [lastChampionId, setLastChampionId] = useState(0);
    const [userTookControl, setUserTookControl] = useState(false);

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const [champions, setChampions] = useContext(ChampionsContext);


    // load setting from file
    useEffect(() => {
        files.loadJSON(filePath).then((settings) => {
            setEnabled(settings.enabled);

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
            enabled,
            topChampionList,
            jungleChampionList,
            middleChampionList,
            bottomChampionList,
            supportChampionList
        }

        if (settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);

    }, [enabled, topChampionList, jungleChampionList, middleChampionList, bottomChampionList, supportChampionList])

    const giveUpControl = () => {
        setUserTookControl(false);
        setLastChampionId(0);
    };

    // pooling client status
    useEffect(() => {

        const updateFunction = () => {
            getChampionSelectState(lockfileContent).then((state) => {
                const phase = state.phase;
                setChampionSelectPhase(phase);

                const championId = state.championId;
                const controlTakenNow = lastChampionId !== championId && lastChampionId !== 0;

                if (controlTakenNow)
                    setUserTookControl(true);

                setLastChampionId(championId);
                console.log({ state, lastChampionId, championId, controlTakenNow, phase });

                const isInBanningPhase = phase === ChampionSelectPhase.Banning || phase === ChampionSelectPhase.BanHovered;

                // if (isInBanningPhase && !userTookControl && !controlTakenNow) {
                //     const idBanList = banList.map(name => parseInt(champions[name]));

                //     const picks = state.picks;
                //     const bans = state.bans;
                //     const noBanList = bans.concat(picks).filter(noBan => noBan !== championId);

                //     console.log({ idBanList, bans, picks, noBanList, championId, lastChampionId });

                //     const championToBan = idBanList.find(ban => !noBanList.includes(ban));

                //     if (championToBan) {
                //         if (championToBan !== championId) {
                //             setLastChampionId(championToBan);
                //             hoverChampion(lockfileContent, state.actionId, championToBan);
                //         }
                //     }
                //     else
                //         console.warn({ messaage: "No champion from ban list matches criteria", banList, noBanList });
                // }

                const idlePhases = [ChampionSelectPhase.NoClient, ChampionSelectPhase.NoInChampionSelect, ChampionSelectPhase.InChampionSelect, ChampionSelectPhase.Unknown];
                if (idlePhases.includes(phase) || championSelectPhase !== phase)
                    giveUpControl();
            });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, 500));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent, settingsLoaded, userTookControl, lastChampionId, championSelectPhase]);

    // clearing state when turned off
    useEffect(() => {
        if (!enabled)
            setChampionSelectPhase(initialPhase);
    }, [enabled]);

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
        case ChampionSelectPhase.Banning:
        case ChampionSelectPhase.BanHovered:
            {
                currentMessage = banningMessage;
                break;
            }
        case ChampionSelectPhase.Picking:
        case ChampionSelectPhase.PickHovered:
            {
                currentMessage = pickingMessage;
                break;
            }
        case ChampionSelectPhase.Picked: {
            currentMessage = pickedMessage;
            break;
        }
        case ChampionSelectPhase.Error: {
            currentMessage = errorStateMessage("Don't know what happened but it's not good! Maybe client isn't running?");
            break;
        }
    }


    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnabled(event.target.checked);
    };

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();

    const patch = champions["patch"];

    const controlMessage = userTookControl ? userInControl(giveUpControl) : appInControl;

    return (
        <Container>
            <Stack spacing={3}>
                <Stack>
                    <FormControlLabel
                        control={<Switch checked={enabled} onChange={handleSwitchChange} />}
                        label={<Typography>Enable <strong>Smart Pick</strong></Typography>}
                    />
                </Stack>

                {enabled ? (<Stack>{controlMessage}</Stack>) : ""}

                <Stack>
                    {currentMessage}
                </Stack>
                <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                            Champion pool
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                <Stack spacing={2}>
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
                <Stack>
                    {/* <Alert severity="info">
                        <AlertTitle>How does it work?</AlertTitle>
                        When banning phase starts,
                        app will hover first champion from your list that is not <strong>already banned</strong> and
                        is not a <strong>ban intent</strong> or <strong>pick intent</strong> of any ally.

                        <ul>
                            <li>If champion from your ban list matches criteria, nothing will be hovered.</li>
                            <li>App will adjust this hover in real time.</li>
                            <li>Hovering something by yourself takes control from the app.</li>
                        </ul>
                    </Alert> */}
                </Stack>
            </Stack>
        </Container>
    );
}