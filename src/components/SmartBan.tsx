import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete } from '@mui/material';

import * as files from '../libs/files';
import * as connections from '../libs/connections'

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './CommonMessages';

const filePath = "settings/smartban.settings.json";

enum ChampionSelectPhase {
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
        state: ChampionSelectPhase.Unknown,
        timer: 0
    };
    const [lobbyState, setLobbyState] = useState(initialLobbyState);
    const [banList, setBanList] = useState([]);
    const [secondsToAction, setSecondsToAction] = useState(20);

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
            getLobbyState(lockfileContent).then((state) => {
                console.log(state);
                if (state.state === ChampionSelectPhase.Banning && state.counter >= secondsToAction || state.counter === -1) {
                    const idBanList = banList.map(name => parseInt(champions[name]));
                    
                    const picks = state.picks;
                    const bans = state.bans;
                    const noBanList = bans.concat(picks);

                    console.log({idBanList, bans, picks, noBanList});

                    const championToBan = idBanList.find(ban => !noBanList.includes(ban));
                    if (championToBan)
                        hoverChampion(lockfileContent, state.actionId, championToBan);
                        // instantCompleteAction(lockfileContent, state.actionId, championToBan);
                    else
                        console.warn("No champion could be banned", banList, noBanList);
                }
            });
        }

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (enabled)
            setPeriodicUpdate(setInterval(updateFunction, 1000));

        return () => clearInterval(periodicUpdate);

    }, [enabled, lockfileContent, settingsLoaded, banList]);

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
                        After around <strong>{secondsToAction}</strong> seconds since start of the banning phase, 
                        if you are <strong>not hovering any ban intent</strong> app will hover for a ban first champion from your list that isn't <strong>already banned</strong> and 
                        isn't a <strong>pick intent</strong> of any ally. If no such champion is found, nothing will happen.
                        <br/>
                        <br/>
                        Timing can adjust that with slider below. Keep in mind that it is not exact, client updates its timer around every 4 seconds.
                    </Alert>
                </Stack>
                <Stack>
                    <Slider onChange={handleTimeChange} value={secondsToAction} valueLabelDisplay="auto" step={1} marks min={10} max={24}/>
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

    const lobbyState = { 
        state: undefined as ChampionSelectPhase,
        actionId: undefined as number,
        counter: undefined as number,
        picks: undefined as number[],
        bans: undefined as number[]
    };

    let session = null;
    try {
        session = await connections.fetchJSON(url);
    } catch(error) {
        console.warn(error);
        lobbyState.state = ChampionSelectPhase.NoClient;
        return lobbyState;
    }

    // console.log(session);

    if (session.message === "No active delegate") {
        lobbyState.state = ChampionSelectPhase.NoInLobby;
        return lobbyState;
    }

    const counter = session.counter as number;
    lobbyState.counter = counter;

    if (session.timer.phase === "PLANNING") {
        lobbyState.state = ChampionSelectPhase.Planning;
        return lobbyState;
    }

    const bans = getBans(session);
    lobbyState.bans = bans;

    const picks = getPicks(session);
    lobbyState.picks = picks;

    const userActions = getUserActions(session);
    const uncompletedActions = userActions.filter(action => !action.completed);
    if(uncompletedActions.length < 1) {
        lobbyState.state = ChampionSelectPhase.Picked;
        return lobbyState;
    }

    let activeAction = uncompletedActions.find(action => action.isInProgress);

    if (!activeAction)
        lobbyState.state = ChampionSelectPhase.InLobby;
    else {
        lobbyState.actionId = activeAction.id;
        
        const isHovering = activeAction.championId > 0;
        if(activeAction.type === "ban") 
            if(isHovering) 
                lobbyState.state = ChampionSelectPhase.BanHovered;
            else 
                lobbyState.state = ChampionSelectPhase.Banning;
        else 
        if (activeAction.type === "pick")
            if(isHovering) 
                lobbyState.state = ChampionSelectPhase.PickHovered;
            else 
                lobbyState.state = ChampionSelectPhase.Picking;
        else
            lobbyState.state = ChampionSelectPhase.Unknown;
    }

    return lobbyState;
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

async function asyncClientRequest(lockfileContent: any, endpointName: string, options: any = { method: 'GET' }) {
    const {protocol, port, username, password} = lockfileContent;
    const urlWithAuth = connections.clientURL(port, password, username, protocol);
    const url = urlWithAuth + endpointName;

    return connections.fetchRaw(url, options)
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

function getBans(session: any): number[] {
    const bans: number[] = [];
    for (const phase of session.actions) {
        for (const action of phase) {
            if (action.type === "ban" && action.championId > 0)
                bans.push(action.championId as number);
        }
    }
    return bans;
}

function getPicks(session: any): number[] {
    const picks: number[] = [];
    for (const phase of session.actions) {
        for (const action of phase) {
            if (action.type === "pick" && action.championId > 0)
                picks.push(action.championId as number);
        }
    }
    return picks;
}