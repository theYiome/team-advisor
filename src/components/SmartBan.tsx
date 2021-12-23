import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete } from '@mui/material';

import * as files from '../libs/files';
import * as connections from '../libs/connections'

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './CommonMessages';

const filePath = "settings/smartban.settings.json";

enum ChampionSelectState {
    NoClient,
    NoInLobby,
    InLobby,
    Planning,
    Banning,
    BanHovered,
    Picking,
    PickHovered,
    Picked,
    Unknown,
    Error
}

export const SmartBan: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);

    const initialLobbyState = {
        state: ChampionSelectState.Unknown,
        timer: 0
    };
    const [lobbyState, setLobbyState] = useState(initialLobbyState);
    const [banList, setBanList] = useState([]);
    const [secondsToAction, setSecondsToAction] = useState(8);

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const [champions, setChampions] = useContext(ChampionsContext);


    // load setting from file
    useEffect(() => {
        files.loadJSON(filePath).then((settings) => {
            setEnabled(settings.enabled);
            setSecondsToAction(settings.secondsToAction);
            setBanList(settings.banList);
            setSettingsLoaded(true);
        }).catch(error => {
            console.warn(error);
            setSettingsLoaded(true);
        });
    }, [])

    // save settings to file when settings are updated
    useEffect(() => {
        const dataToSave = {
            enabled: enabled,
            banList: banList,
            secondsToAction: secondsToAction
        }

        if(settingsLoaded)
            files.saveJSON(dataToSave, filePath, 4);
            
    }, [enabled, secondsToAction, banList])

    // pooling client status
    useEffect(() => {

        const updateFunction = () => {
            // getQueueState(lockfileContent).then((state) => {
            //     setQueueState(state);

            //     if (state.state === QueueStateEnum.GameFound && state.timer >= secondsToAction)
            //         acceptQueue(lockfileContent);
            // });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, 700));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent, settingsLoaded]);

    // clearing state when turned off
    useEffect(() => {
        if(!enabled)
            setLobbyState(initialLobbyState);
    }, [enabled]);

    
    const handleTimeChange = (event: Event, newValue: number, activeThumb: number) => {
        setSecondsToAction(newValue);
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnabled(event.target.checked);
    };

    const enablingSwitch = (
        <Switch
            color='success'
            checked={enabled}
            onChange={handleSwitchChange}
        />
    );

    const switchLabel = (<>Enable <strong>Smart Ban</strong></>);
    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();

    return (
        <Container>
            <Stack spacing={3}>
                <Stack>
                    <Button onClick={() => getInfo(lockfileContent)} variant="contained">GET INFO</Button>
                    <Button onClick={async () => console.log(await getLobbyState(lockfileContent))} variant="contained">GET LOBBY STATE</Button>
                </Stack>
                <Stack>
                    <FormControlLabel control={enablingSwitch} label={switchLabel} />
                </Stack>
                <Stack>
                    <Autocomplete
                        multiple
                        options={championNames}
                        value={banList}
                        onChange={(event, newValue) => {
                            console.log(newValue);
                            setBanList(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Ban list"
                                placeholder="champions to ban in order"
                            />
                        )}
                    />
                </Stack>
                <Stack>
                    <Alert severity="info">
                        <AlertTitle>How does it work?</AlertTitle>
                        After <strong>{secondsToAction} {secondsToAction > 1.1 ? "seconds" : "second"}</strong> since start of the banning phase, 
                        if you are <strong>not hovering any ban intent</strong> there will be an attempt to ban first champion from your list that isn't <strong>already banned</strong> and 
                        isn't a <strong>pick intent</strong> of any ally and isn't currently <strong>disabled</strong> (for example due to game breaking bug).
                        If no such champion is found, nothing will happen.
                        <br/>
                        Timing can adjust that with slider below.
                    </Alert>
                </Stack>
                <Stack>
                    <Slider onChange={handleTimeChange} value={secondsToAction} valueLabelDisplay="auto" step={1} marks min={1} max={12}/>
                </Stack>
            </Stack>
        </Container>
    );
}

/*
    GET /lol-champ-select/v1/bannable-champions
    GET /lol-champ-select/v1/current-champion	
    GET /lol-champ-select/v1/disabled-champions
    GET /lol-champ-select/v1/pickable-champions
    GET /lol-champ-select/v1/session/timer
*/

async function getLobbyState(lockfileContent: any) {

    const {protocol, port, username, password} = lockfileContent;

    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const endpointName = "lol-champ-select/v1/session";
    const url = urlWithAuth + endpointName;

    let session = null;
    try {
        session = await connections.fetchJSON(url);
    } catch(error) {
        console.warn(error);
        return {
            state: ChampionSelectState.NoClient
        }
    }

    console.log(session);

    if (session.message === "No active delegate") return {
        state: ChampionSelectState.NoInLobby
    }

    const counter = session.counter;
    if (session.timer.phase === "PLANNING") return {
        state: ChampionSelectState.Planning,
        counter: counter
    }

    const userActions = getUserActions(session);

    const uncompletedActions = userActions.filter(action => !action.completed);
    if(uncompletedActions.length < 1) return {
        state: ChampionSelectState.Picked
    }

    let activeAction = uncompletedActions.find(action => action.isInProgress);

    if (!activeAction) return {
        state: ChampionSelectState.InLobby
    }
    else {
        const isHovering = activeAction.championId > 0;
        const actionId = activeAction.id;

        if(activeAction.type === "ban") 
            if(isHovering) return {
                state: ChampionSelectState.BanHovered,
                actionId: actionId,
                counter: counter
            }
            else return {
                state: ChampionSelectState.Banning,
                actionId: actionId,
                counter: counter
            }
        else if (activeAction.type === "pick")             
            if(isHovering) return {
                state: ChampionSelectState.PickHovered,
                actionId: actionId,
                counter: counter
            }
            else return {
                state: ChampionSelectState.Picking,
                actionId: actionId,
                counter: counter
            }
        else return {
            state: ChampionSelectState.Unknown,
            actionId: actionId,
            counter: counter
        }
    }
}

async function hoverChampion(lockfileContent: any, actionId: number, championId: number) {
    const options = {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: { championId },
        json: true
    }
    return asyncClientRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}`, options);
}

async function completeAction(lockfileContent: any, actionId: number) {
    return asyncClientRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}/complete`, { method: "POST" });
}

function instantCompleteAction(lockfileContent: any, actionId: number, championId: number) {
    hoverChampion(lockfileContent, actionId, championId).then((result) => completeAction(lockfileContent, actionId));
}

function getInfo(lockfileContent: any): void {
    clinetRequest(lockfileContent, "lol-champ-select/v1/session");
}

async function asyncClientRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchRaw(url, options)
}

function clinetRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;

    try {
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        connections.fetchJSON(url, options).then((clientResponse) => {
            console.log(url, clientResponse);
        }).catch(err => console.warn(err));
    } 
    catch(err) {
        console.warn(err);
    }
}

function getUserActions(session: any) {
    const actionsFlat = [];
    for (const actionSection of session.actions) {
        for (const action of actionSection) {
            actionsFlat.push(action);
        }
    }

    return actionsFlat.filter(action => session.localPlayerCellId === action.actorCellId).sort((a, b) => a.id - b.id);
}