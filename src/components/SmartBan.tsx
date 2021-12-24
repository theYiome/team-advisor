import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete } from '@mui/material';

import * as files from '../libs/files';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { noClientMessage, errorStateMessage } from './CommonMessages';
import { ChampionSelectPhase, getChampionSelectState, hoverChampion } from '../componentLibs/championSelect';

const filePath = "settings/smartban.settings.json";

export const SmartBan: FC<any> = (): ReactElement => {

    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);

    const initialPhase = ChampionSelectPhase.Unknown;

    const [championSelectPhase, setChampionSelectPhase] = useState(initialPhase);
    const [banList, setBanList] = useState([]);
    const [secondsToAction, setSecondsToAction] = useState(20);

    const [lastChampionId, setLastChampionId] = useState(0);
    const [userTookControl, setUserTookControl] = useState(false);

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
            getChampionSelectState(lockfileContent).then((state) => {
                console.log(state);
                const phase = state.phase;
                const counter = state.counter;
                
                const controlTakenNow = lastChampionId !== 0 && lastChampionId !== state.championId;

                if (controlTakenNow)
                    setUserTookControl(true);
                
                setLastChampionId(state.championId);
                
                const isInBanningPhase = phase === ChampionSelectPhase.Banning || phase === ChampionSelectPhase.BanHovered;
                const isRightTime = counter >= secondsToAction || counter === -1;
                
                if (isInBanningPhase && isRightTime && !userTookControl && !controlTakenNow) {
                    const idBanList = banList.map(name => parseInt(champions[name]));
                    
                    const picks = state.picks;
                    const bans = state.bans;
                    const noBanList = bans.concat(picks).filter(noBan => noBan !== state.championId);
                    
                    console.log({idBanList, bans, picks, noBanList});
                    
                    const championToBan = idBanList.find(ban => !noBanList.includes(ban));
                    if (championToBan)
                        hoverChampion(lockfileContent, state.actionId, championToBan);
                    else
                        console.warn("No champion could be banned", banList, noBanList);
                }
                
                const idlePhases = [ChampionSelectPhase.NoClient, ChampionSelectPhase.NoInLobby, ChampionSelectPhase.InLobby, ChampionSelectPhase.Unknown];
                if (idlePhases.includes(phase) || championSelectPhase !== phase) {
                    setUserTookControl(false);
                    setLastChampionId(0);
                }

                setChampionSelectPhase(phase);
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
            setChampionSelectPhase(initialPhase);
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
                    userTookControl: {userTookControl.toString()}
                    <br></br>
                    lastChampionId: {lastChampionId.toString()}
                    <br></br>
                    championSelectPhase: {championSelectPhase.toString()}
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
                    <Slider onChange={handleTimeChange} value={secondsToAction} valueLabelDisplay="auto" step={1} marks min={0} max={24}/>
                </Stack>
            </Stack>
        </Container>
    );
}