import React, { useState, useContext, useEffect, createContext, useRef } from 'react';

import Container from '@mui/material/Container'

import { useSnackbar } from 'notistack';
import { LockfileContext } from '../LockfileContext';
import { completeAction, hoverChampion } from '../SmartChampionSelect/SmartChampionSelectLogic';
import { ChampionsContext } from '../ChampionsContext';

export const LcuContext = createContext(null);

export const LcuStateProvider = () => {

    const verySlowUpdateInterval = 4000;
    const slowUpdateInterval = 2000;
    const fastUpdateInterval = 300;

    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(verySlowUpdateInterval);

    const currentState = useRef({
        phase: undefined as LcuPhase,
        queueTimer: undefined as number,

        actionTimer: new Date() as Date,
        failedToHover: [] as number[],
        userTookControl: false as boolean,

        currentActionId: undefined as number,
        pickActionId: undefined as number,
        championId: 0 as number,
        isHovering: false as boolean,
        isDraft: true as boolean,
        counter: undefined as number,
        picks: [] as number[],
        bans: [] as number[],
        gameId: undefined as number,
        localPlayerCellId: undefined as number,
        localPlayerTeamId: undefined as number,
        leftTeam: [] as any[],
        rightTeam: [] as any[]
    });

    const predictions = [1, 3, 4];


    // https://stackoverflow.com/questions/41632942/how-to-measure-time-elapsed-on-javascript
    const elapsedTimeSinceLastAction = () => ((new Date() as any) - (currentState.current.actionTimer as any)) / 1000;

    const [lockfileContent, setLockfileContent] = useContext(LockfileContext);
    const [champions, setChampions] = useContext(ChampionsContext);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const swapRolesInTeam = (firstRole: string, secondRole: string, team: any[]) => {
        team.forEach(x => {
            if (x.assignedPosition === firstRole)
                x.assignedPosition = secondRole;
            else if (x.assignedPosition === secondRole)
                x.assignedPosition = firstRole;
        })
    };

    const updateFunction = () => {

        console.log({ elapsed: elapsedTimeSinceLastAction() });

        if (lockfileContent.port === "")
            currentState.current.phase = LcuPhase.ClientClosed;


        getLcuState(lockfileContent).then((state) => {
            console.log({ state });

            const isInPickingPhase = state.phase === LcuPhase.Picking;
            const isInBanningPhase = state.phase === LcuPhase.Banning;

            // lockin when reaches ~30 seconds in picking phase - draft only
            if (state.phase !== currentState.current.phase) {
                currentState.current.actionTimer = new Date();
            }

            else if (isInPickingPhase && state.isDraft && (elapsedTimeSinceLastAction() >= 31.0))
                completeAction(lockfileContent, state.currentActionId);

            // check if worth updating
            if ([LcuPhase.Planning, LcuPhase.Banning, LcuPhase.Picking, LcuPhase.InChampionSelect].includes(state.phase)) {

                const championId = state.championId;
                const picks = state.picks;
                const bans = state.bans;

                const unavailableChampions = bans.concat(picks)
                    .concat(currentState.current.failedToHover)
                    .filter(unavailable => unavailable !== championId);

                const allPlayers = state.leftTeam.concat(state.rightTeam);
                const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                const roleFromChampionSelect = user ? user.assignedPosition : "";

                let preferredChampionList: string[] = roleToChampionList[roleFromChampionSelect];
                if (preferredChampionList) {

                }

                const newIdPreferredChampionList = preferredChampionList.map(name => parseInt(champions[name]));

                const attemptToHover = (championIdToHover: number) => {
                    if (championIdToHover && championIdToHover !== state.championId) {

                        if (currentState.current.championId !== state.championId)
                            currentState.current.championId = championIdToHover;

                        hoverChampion(lockfileContent, state.currentActionId, championIdToHover).then((response: any) => {
                            if (response && response.errorCode) {
                                currentState.current.failedToHover = [...currentState.current.failedToHover, championIdToHover];
                            }
                        });
                    }
                }

                // check if user made any action
                currentState.current.userTookControl =
                    currentState.current.championId !== championId &&
                    currentState.current.championId !== 0 && championId !== 0;
                
                currentState.current.championId = championId;

                if (currentState.current.userTookControl) {
                    // if control not taken app can perform an action
                    if (isInBanningPhase) {
                        // const idBanList = banList.map(name => parseInt(champions[name]));
                        const idBanList = [3, 7, 12, 19];
                        const championToBan = idBanList.find(ban => !unavailableChampions.includes(ban));
                        attemptToHover(championToBan);
                    }
                }

                // if no champion is hovered in picking phase, hover something
                if (isInPickingPhase) {
                    if (predictions.length > 0 && championId === 0) {
                        const championToPick = predictions.find(pick => !unavailableChampions.includes(pick));
                        console.log({ allPlayers, user, roleFromChampionSelect, championList: preferredChampionList, unavailableChampions, choosenChampion: championToPick });
                        attemptToHover(championToPick);
                    }
                }

            }

        });
    };


    // pooling client status
    useEffect(() => {
        updateFunction();

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        if (true)
            setPeriodicUpdate(setInterval(updateFunction, updateInterval));

        return () => clearInterval(periodicUpdate);

    }, []);

    // clearing state when turned off
    useEffect(() => {
        currentState.current.actionTimer = new Date();
    }, []);


    return (
        <Container>
        </Container>
    );
}