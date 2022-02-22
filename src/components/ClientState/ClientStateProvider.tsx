import React, { useState, useContext, useEffect, createContext, useRef } from 'react';

import { useSnackbar } from 'notistack';
import { LcuContext } from '../LcuProvider';

import { ChampionsContext } from '../ChampionProvider';
import { completeAction, getLcuState, hoverChampion, ClientPhase } from './ClientStateProviderLogic';
import { Lcu, LolChampionSelectV1 } from './ClientStateTypes';
import { SettingsContext } from '../Settings/SettingsProvider';
import * as connections from '../../libs/connections';
import { acceptQueue } from '../SmartAccept/SmartAcceptLogic';


const ClientStateContext = createContext({
    phase: ClientPhase.Unknown,
    leftTeam: [] as LolChampionSelectV1.Team[],
    rightTeam: [] as LolChampionSelectV1.Team[],
    localPlayerCellId: -1,
    championId: 0,
    bans: [] as number[],
    predictions: [] as number[],
    loadingPredictions: false,
    getPredictions: async (endpoint: string) => [1, 2, 3],
    hoverChampion: async (championId: number) => true,
    setRoleSwap: (role: LolChampionSelectV1.Position) => { }
});

const ClientStateProvider: React.FC = ({ children }) => {

    const verySlowUpdateInterval = 4000;
    const slowUpdateInterval = 2000;
    const mediumUpdateInterval = 1000;
    const fastUpdateInterval = 300;

    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(verySlowUpdateInterval);


    const lcuState = useContext(LcuContext);
    const { championIdToName, championNameToId, patch } = useContext(ChampionsContext);
    const { settingsState } = useContext(SettingsContext);

    const currentState = useRef({
        phase: ClientPhase.Unknown as ClientPhase,
        queueTimer: 0 as number,

        actionTimer: new Date() as Date,
        failedToHover: [] as number[],
        predictions: [] as number[],
        userTookControl: false as boolean,
        role: "" as LolChampionSelectV1.Position,

        currentActionId: -1 as number,
        pickActionId: -1 as number,
        banActionId: -1 as number,
        championId: 0 as number,
        isHovering: false as boolean,
        isDraft: true as boolean,
        counter: 0 as number,
        picks: [] as number[],
        bans: [] as number[],
        gameId: 0 as number,
        localPlayerCellId: -1 as number,
        localPlayerTeamId: -1 as number,
        leftTeam: [] as LolChampionSelectV1.Team[],
        rightTeam: [] as LolChampionSelectV1.Team[]
    });

    // https://stackoverflow.com/questions/41632942/how-to-measure-time-elapsed-on-javascript
    const elapsedTimeSinceLastAction = () => ((new Date() as any) - (currentState.current.actionTimer as any)) / 1000;


    const [currentPhase, setCurrentPhase] = useState(ClientPhase.Unknown);
    const [currentLeftTeam, setCurrentLeftTeam] = useState([] as LolChampionSelectV1.Team[]);
    const [currentRightTeam, setCurrentRightTeam] = useState([] as LolChampionSelectV1.Team[]);
    const [currentLocalPlayerCellId, setCurrentLocalPlayerCellId] = useState(0);
    const [currentChampionId, setCurrentChampionId] = useState(0);
    const [currentBans, setCurrentBans] = useState([] as number[]);
    const [currentPredictions, setCurrentPredictions] = useState([] as number[]);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [roleSwappedWith, setRoleSwappedWith] = useState("" as LolChampionSelectV1.Position);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const swapRolesInTeam = (firstRole: string, secondRole: string, team: any[]) => {
        team.forEach(x => {
            if (x.assignedPosition === firstRole)
                x.assignedPosition = secondRole;
            else if (x.assignedPosition === secondRole)
                x.assignedPosition = firstRole;
        })
    };

    const favouritesForRole = (role: LolChampionSelectV1.Position): number[] => {
        let preferredChampionList: string[] = settingsState.favourites[role];
        return preferredChampionList.map(name => championNameToId[name]);
    }

    const updateFunction = () => {

        console.log({ lcuState });

        if (!lcuState.valid) {
            currentState.current.phase = ClientPhase.ClientClosed;
            if (currentPhase !== ClientPhase.ClientClosed)
                setCurrentPhase(ClientPhase.ClientClosed);
            return;
        }


        getLcuState(lcuState.credentials).then((state) => {
            if ([ClientPhase.GameAccepted, ClientPhase.GameDeclined, ClientPhase.GameFound, ClientPhase.InQueue].includes(state.phase)) {
                currentState.current.queueTimer = state.queueTimer;
                if (state.phase === ClientPhase.GameFound && currentState.current.queueTimer >= settingsState.gameAcceptTimer)
                    acceptQueue(lcuState.credentials);

                if (state.phase !== currentPhase)
                    setCurrentPhase(state.phase);
            }
            else if ([ClientPhase.Planning, ClientPhase.Banning, ClientPhase.Picking, ClientPhase.InChampionSelect, ClientPhase.Done].includes(state.phase)) {
                // do role swap if selected by the user
                if (roleSwappedWith !== LolChampionSelectV1.Position.None) {
                    const allPlayers = state.leftTeam.concat(state.rightTeam);
                    const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                    const userRole = user ? user.assignedPosition : LolChampionSelectV1.Position.None;

                    if (roleSwappedWith !== userRole)
                        state.localPlayerTeamId === 0 ?
                            swapRolesInTeam(userRole, roleSwappedWith, state.leftTeam) :
                            swapRolesInTeam(userRole, roleSwappedWith, state.rightTeam);
                }

                console.log({ state });

                const isInPickingPhase = state.phase === ClientPhase.Picking;
                const isInBanningPhase = state.phase === ClientPhase.Banning;
                const phase = state.phase;

                // lockin when reaches ~30 seconds in picking phase - draft only
                if (phase !== currentState.current.phase) {
                    currentState.current.actionTimer = new Date();
                    currentState.current.failedToHover = [];
                }
                else if (isInPickingPhase && state.isDraft && (elapsedTimeSinceLastAction() >= settingsState.championLockinTimer))
                    completeAction(lcuState.credentials, state.currentActionId);

                const unavailableChampions = state.bans.concat(state.picks)
                    .concat(currentState.current.failedToHover)
                    .filter(unavailable => unavailable !== state.championId);

                const allPlayers = state.leftTeam.concat(state.rightTeam);
                const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                const roleFromChampionSelect = user ? user.assignedPosition : "";

                if (roleFromChampionSelect !== LolChampionSelectV1.Position.None && roleFromChampionSelect !== currentState.current.role) {
                    currentState.current.role = roleFromChampionSelect;
                }

                const attemptToHover = (championIdToHover: number) => {
                    if (championIdToHover && championIdToHover !== state.championId) {

                        if (currentState.current.championId !== state.championId)
                            currentState.current.championId = championIdToHover;

                        hoverChampion(lcuState.credentials, state.currentActionId, championIdToHover).then((response: any) => {
                            if (response && response.errorCode) {
                                currentState.current.failedToHover = [...currentState.current.failedToHover, championIdToHover];
                            }
                        });
                    }
                }

                // check if user made any action
                currentState.current.userTookControl =
                    currentState.current.championId !== state.championId &&
                    currentState.current.championId !== 0 && state.championId !== 0;

                currentState.current.championId = state.championId;

                if (!currentState.current.userTookControl) {
                    // if control not taken app can perform an action
                    if (isInBanningPhase) {
                        const idBanList: number[] = settingsState.prefferedBans.map(name => championNameToId[name]);
                        const championToBan: number = idBanList.find(ban => !unavailableChampions.includes(ban));
                        attemptToHover(championToBan);
                    }
                }

                // if no champion is hovered in picking phase, hover something
                if (isInPickingPhase) {
                    if (currentState.current.predictions.length > 0 && state.championId === 0) {
                        const championToPick = currentState.current.predictions.find(pick => !unavailableChampions.includes(pick));
                        attemptToHover(championToPick);
                    }
                }

                // set immediate state
                {
                    currentState.current.bans = state.bans;
                    currentState.current.picks = state.picks;
                    currentState.current.localPlayerCellId = state.localPlayerCellId;
                    currentState.current.localPlayerTeamId = state.localPlayerTeamId;
                    currentState.current.gameId = state.gameId;
                    currentState.current.leftTeam = state.leftTeam;
                    currentState.current.rightTeam = state.rightTeam;
                    currentState.current.championId = state.championId;
                    currentState.current.currentActionId = state.currentActionId;
                    currentState.current.pickActionId = state.pickActionId;
                    currentState.current.banActionId = state.banActionId;
                }

                // set state that is part of the context
                {
                    if (!compareTeams(currentState.current.leftTeam, currentLeftTeam))
                        setCurrentLeftTeam(currentState.current.leftTeam);
                    if (!compareTeams(currentState.current.rightTeam, currentRightTeam))
                        setCurrentRightTeam(currentState.current.rightTeam);
                    if (currentState.current.championId !== currentChampionId)
                        setCurrentChampionId(currentState.current.championId);
                    if (!compareArrays(currentState.current.bans, currentBans))
                        setCurrentBans(currentState.current.bans);
                    if (currentState.current.localPlayerCellId !== currentLocalPlayerCellId)
                        setCurrentLocalPlayerCellId(currentState.current.localPlayerCellId);
                }

            }
            currentState.current.phase = state.phase;
            if (currentState.current.phase !== currentPhase)
                setCurrentPhase(currentState.current.phase);
        });
    };

    // pooling client status
    useEffect(() => {
        updateFunction();

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        setPeriodicUpdate(setInterval(updateFunction, updateInterval));

        return () => clearInterval(periodicUpdate);
    }, [updateInterval, lcuState.valid, lcuState.credentials, roleSwappedWith]);

    // clearing state when turned off
    useEffect(() => {
        currentState.current.actionTimer = new Date();
    }, [settingsState.autoAccept, settingsState.autoBan, settingsState.autoPick]);

    useEffect(() => {
        if (currentPhase === ClientPhase.ClientClosed) {
            if (updateInterval !== verySlowUpdateInterval)
                setUpdateInterval(verySlowUpdateInterval);
        }
        else if ([ClientPhase.GameFound, ClientPhase.Picking, ClientPhase.Banning].includes(currentPhase)) {
            if (updateInterval !== fastUpdateInterval)
                setUpdateInterval(fastUpdateInterval);
        }
        else if ([ClientPhase.InQueue, ClientPhase.InChampionSelect].includes(currentPhase)) {
            if (updateInterval !== mediumUpdateInterval)
                setUpdateInterval(mediumUpdateInterval);
        }
        else if (updateInterval !== slowUpdateInterval)
            setUpdateInterval(slowUpdateInterval)
    }, [currentPhase]);


    const getPredictions = async (endpoint: string) => {
        setLoadingPredictions(true);

        const options = {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: {
                leftTeam: currentState.current.leftTeam,
                rightTeam: currentState.current.rightTeam,
                bans: currentState.current.bans,
                localPlayerCellId: currentState.current.localPlayerCellId,
                localPlayerTeamId: currentState.current.localPlayerTeamId,
                preferredChampionList: favouritesForRole(currentState.current.role)
            },
            json: true
        };

        console.log({ getPredictions: options });

        try {
            const response = await connections.fetchJSON(endpoint, options);
            console.log({ response, options, type: typeof (response) });
            const content: number[] = response["sorted_champion_ids"];
            setLoadingPredictions(false);
            if (content) {
                currentState.current.predictions = content;
                setCurrentPredictions(content);
                return content;
            }
            else
                return [];
        }
        catch (error) {
            setLoadingPredictions(false);
            console.warn(error);
            return [];
        }
    }

    const userRequestedHoverChampion = async (championIdToHover: number, actionType = LolChampionSelectV1.ActionType.Pick) => {
        const getProperActionId = (actionType: LolChampionSelectV1.ActionType) => {
            switch (actionType) {
                case LolChampionSelectV1.ActionType.Pick: return currentState.current.pickActionId;
                case LolChampionSelectV1.ActionType.Ban: return currentState.current.banActionId;
                default: return currentState.current.currentActionId;
            };
        };

        let actionId = getProperActionId(actionType);

        return hoverChampion(lcuState.credentials, actionId, championIdToHover).then((response: any) => {
            if (response && response.errorCode) {
                console.error({ response });
                enqueueSnackbar(`Failed to hover ${championIdToName[championIdToHover]}! Maybe unowned?`, { variant: "error" });
                return false;
            }
            return true;
        });
    };


    return (
        <ClientStateContext.Provider value={{
            phase: currentPhase,
            leftTeam: currentLeftTeam,
            rightTeam: currentRightTeam,
            localPlayerCellId: currentLocalPlayerCellId,
            championId: currentChampionId,
            bans: currentBans,
            predictions: currentPredictions,
            loadingPredictions: loadingPredictions,
            getPredictions: getPredictions,
            hoverChampion: userRequestedHoverChampion,
            setRoleSwap: setRoleSwappedWith
        }}>
            {children}
        </ClientStateContext.Provider>
    );
}


export { ClientStateContext, ClientStateProvider };


const compareTeams = (a: LolChampionSelectV1.Team[], b: LolChampionSelectV1.Team[]) => {
    return a.length === b.length && a.every((value, index) => (
        value.championId === b[index].championId &&
        value.championPickIntent === b[index].championPickIntent &&
        value.summonerId === b[index].summonerId &&
        value.assignedPosition === b[index].assignedPosition
    ));
};

const compareArrays = (a: any[], b: any[]) => a.length === b.length && a.every((value, index) => value === b[index]);