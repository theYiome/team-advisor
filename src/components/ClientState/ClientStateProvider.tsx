import React, { useState, useContext, useEffect, createContext, useRef } from 'react';

import { useSnackbar } from 'notistack';
import { LcuContext } from '../LCU/LcuProvider';

import { ChampionsContext } from '../Champions/ChampionProvider';
import { completeAction, getLcuState, hoverChampion, ClientPhase, acceptQueue } from './ClientStateProviderLogic';
import { LolChampionSelectV1 } from './ClientStateTypings';
import { predictionEndpoints, SettingsContext } from '../Settings/SettingsProvider';
import { FavouritesContext } from '../Favourites/FavouritesProvider';
import { getPredictions, Prediction, PredictionApiResponse } from '../Predictions/PredictionsAPI';

const swapRolesInTeam = (newRole: LolChampionSelectV1.Position, team: LolChampionSelectV1.Team[], localPlayerCellId: number) => {
    const userRef = team.find(player => player.cellId === localPlayerCellId);
    if (userRef && userRef.assignedPosition !== LolChampionSelectV1.Position.None)
        team.find(player => player.assignedPosition === newRole).assignedPosition = userRef.assignedPosition;
    userRef.assignedPosition = newRole;
};

const ClientStateContext = createContext({
    phase: ClientPhase.Unknown,
    leftTeam: [] as LolChampionSelectV1.Team[],
    rightTeam: [] as LolChampionSelectV1.Team[],
    localPlayerCellId: -1,
    bans: [] as number[],
    predictions: null as PredictionApiResponse,
    loadingPredictions: false,
    userTookControl: false,
    hoverChampion: async (championId: number) => true,
    setRoleSwap: (role: LolChampionSelectV1.Position) => { }
});

const ClientStateProvider: React.FC = ({ children }) => {
    const verySlowUpdateInterval = 2000;
    const slowUpdateInterval = 1000;
    const mediumUpdateInterval = 500;
    const fastUpdateInterval = 250;

    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(verySlowUpdateInterval);


    const lcuState = useContext(LcuContext);
    const { championIdToName, championNameToId } = useContext(ChampionsContext);
    const { settings } = useContext(SettingsContext);
    const { favourites } = useContext(FavouritesContext);

    const currentState = useRef({
        phase: ClientPhase.Unknown as ClientPhase,
        queueTimer: 0 as number,

        actionTimer: new Date() as Date,
        failedToHover: [] as number[],
        predictions: null as PredictionApiResponse,
        role: LolChampionSelectV1.Position.None as LolChampionSelectV1.Position,

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
    const [currentBans, setCurrentBans] = useState([] as number[]);
    const [currentPredictions, setCurrentPredictions] = useState(null as PredictionApiResponse);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [userTookControl, setUserTookControl] = useState(false);
    const [roleSwappedWith, setRoleSwappedWith] = useState(LolChampionSelectV1.Position.None as LolChampionSelectV1.Position);

    const { enqueueSnackbar } = useSnackbar();

    const bindedGetPredictions = async () => {
        setLoadingPredictions(true);
        const endpoint = predictionEndpoints[settings.predictionEndpoint];
        const favourites = favouritesForRole(currentState.current.role);

        const result = await getPredictions(
            currentState.current.leftTeam, currentState.current.rightTeam,
            currentState.current.localPlayerCellId, currentState.current.localPlayerTeamId,
            favourites, endpoint
        );
        currentState.current.predictions = result;
        setLoadingPredictions(false);
        setCurrentPredictions(result);
    };

    const updateFunction = () => {
        if (!lcuState.valid) {
            console.log("Invalid LCU state, not updating.", lcuState);
            currentState.current.phase = ClientPhase.ClientClosed;
            if (currentPhase !== ClientPhase.ClientClosed)
                setCurrentPhase(ClientPhase.ClientClosed);
        }
        else getLcuState(lcuState.credentials).then((state) => {
            if ([ClientPhase.GameAccepted, ClientPhase.GameDeclined, ClientPhase.GameFound, ClientPhase.InQueue].includes(state.phase)) {
                currentState.current.queueTimer = state.queueTimer;
                if (state.phase === ClientPhase.GameFound && currentState.current.queueTimer >= settings.gameAcceptTimer && settings.autoAccept) {
                    acceptQueue(lcuState.credentials);
                    enqueueSnackbar(`Automatically accepted game after ${settings.gameAcceptTimer}s`, { variant: "default"});
                }
            }
            else if ([ClientPhase.Planning, ClientPhase.Banning, ClientPhase.Picking, ClientPhase.InChampionSelect, ClientPhase.Done].includes(state.phase)) {
                // do role swap if selected by the user
                if (roleSwappedWith !== LolChampionSelectV1.Position.None) {
                    state.localPlayerTeamId === 0 ?
                        swapRolesInTeam(roleSwappedWith, state.leftTeam, state.localPlayerCellId) :
                        swapRolesInTeam(roleSwappedWith, state.rightTeam, state.localPlayerCellId);
                }

                console.log({ state });

                const isInPickingPhase = state.phase === ClientPhase.Picking;
                const isInBanningPhase = state.phase === ClientPhase.Banning;

                // lockin when reaches ~30 seconds in picking phase - draft only
                if (state.phase !== currentState.current.phase) {
                    currentState.current.actionTimer = new Date();
                    currentState.current.failedToHover = [];
                }
                else if (isInPickingPhase && state.isDraft && (elapsedTimeSinceLastAction() >= settings.championLockinTimer) && settings.autoLockin) {
                    completeAction(lcuState.credentials, state.currentActionId);
                    enqueueSnackbar(`Automatically locked-in champion after ${settings.championLockinTimer}s`, { variant: "default"});
                }

                const unavailableChampions = state.bans.concat(state.picks)
                    .concat(currentState.current.failedToHover)
                    .filter(unavailable => unavailable !== state.championId);

                const allPlayers = state.leftTeam.concat(state.rightTeam);
                const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                const roleFromChampionSelect = user ? user.assignedPosition : LolChampionSelectV1.Position.None;

                if (roleFromChampionSelect !== LolChampionSelectV1.Position.None && roleFromChampionSelect !== currentState.current.role) {
                    currentState.current.role = roleFromChampionSelect;
                }

                const attemptToHover = (championIdToHover: number) => {
                    if (championIdToHover && championIdToHover !== state.championId) {
                        hoverChampion(lcuState.credentials, state.currentActionId, championIdToHover).then((response: any) => {
                            if (response && response.errorCode) {
                                currentState.current.failedToHover = [...currentState.current.failedToHover, championIdToHover];
                            }
                            else {
                                if (currentState.current.championId !== state.championId)
                                    currentState.current.championId = championIdToHover;
                                enqueueSnackbar(`Automatically hovered ${championIdToName[championIdToHover]}`, { variant: "default" });
                            }
                        });
                    }
                }

                // check if user made any action
                if (isInPickingPhase && !userTookControl && !currentState.current.isHovering) {
                    const tookControlNow =
                        currentState.current.championId !== state.championId &&
                        currentState.current.championId !== 0 && state.championId !== 0;

                    if (tookControlNow)
                        setUserTookControl(true);
                }
                
                // hover something to ban
                if (state.championId === 0 && settings.autoBan && isInBanningPhase) {
                    const idBanList: number[] = settings.prefferedBans.map(name => championNameToId[name]);
                    const championToBan: number = idBanList.find(ban => !unavailableChampions.includes(ban));
                    attemptToHover(championToBan);
                }

                // if no champion is hovered in picking phase, hover something
                if (isInPickingPhase && settings.autoPick) {
                    if (currentState.current.predictions && state.championId === 0) {
                        const comparePredictions = (a: Prediction, b: Prediction) => b.score - a.score;
                        const championToPick = currentState.current.predictions.predictions.sort(comparePredictions).find(pick => !unavailableChampions.includes(pick.championId));
                        if (championToPick)
                            attemptToHover(championToPick.championId);
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
                    if (!compareTeams(currentState.current.leftTeam, currentLeftTeam)) {
                        console.log({ left: currentState.current.leftTeam, currentLeftTeam });
                        setCurrentLeftTeam(currentState.current.leftTeam);
                    }
                    if (!compareTeams(currentState.current.rightTeam, currentRightTeam)) {
                        console.log({ right: currentState.current.rightTeam, currentRightTeam });
                        setCurrentRightTeam(currentState.current.rightTeam);
                    }
                    if (!compareArrays(currentState.current.bans, currentBans))
                        setCurrentBans(currentState.current.bans);
                    if (currentState.current.localPlayerCellId !== currentLocalPlayerCellId)
                        setCurrentLocalPlayerCellId(currentState.current.localPlayerCellId);
                }

            }

            currentState.current.phase = state.phase;
            if (currentState.current.phase !== currentPhase) {
                console.log({ phase: currentState.current.phase, currentPhase });
                setCurrentPhase(currentState.current.phase);
            }
        });
    };

    // get predictions if user is inchampionselect or picking or planning phase and left or right team has changed
    useEffect(() => {
        if ([ClientPhase.Planning, ClientPhase.InChampionSelect, ClientPhase.Picking, ClientPhase.Banning, ClientPhase.Done].includes(currentPhase))
            bindedGetPredictions();
    }, [currentPhase, currentLeftTeam, currentRightTeam, settings.predictionEndpoint, lcuState]);

    // on phase change, if phase is not Picking, set userTookControl to false
    useEffect(() => {
        if (currentPhase !== ClientPhase.Picking && userTookControl)
            setUserTookControl(false);
    }, [currentPhase]);

    useEffect(() => {
        if (userTookControl)
            enqueueSnackbar("You picked champion in client - picking from app is now disabled", { variant: "error", autoHideDuration: 9000 });
    }, [userTookControl]);

    useEffect(() => {
        if (roleSwappedWith !== LolChampionSelectV1.Position.None)
            enqueueSnackbar(`Showing recommendations for ${roleSwappedWith}`, { variant: "info"});
        else
            enqueueSnackbar(`Role swap disabled`, { variant: "info"});
    }, [roleSwappedWith]);

    // pooling client status
    useEffect(() => {
        updateFunction();

        if (periodicUpdate)
            clearInterval(periodicUpdate);

        setPeriodicUpdate(setInterval(updateFunction, updateInterval));

        return () => clearInterval(periodicUpdate);
    }, [updateInterval, lcuState, roleSwappedWith, settings, currentLeftTeam, currentRightTeam, currentPhase, currentLocalPlayerCellId, currentBans, userTookControl]);

    // clearing state when turned off
    useEffect(() => {
        currentState.current.actionTimer = new Date();
    }, [settings.autoAccept, settings.autoBan, settings.autoPick]);

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

    const favouritesForRole = (role: LolChampionSelectV1.Position): number[] => {
        let preferredChampionList: string[] = favourites[role];
        return preferredChampionList.map(name => championNameToId[name]);
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

        currentState.current.isHovering = true;
        return hoverChampion(lcuState.credentials, actionId, championIdToHover).then((response: any) => {
            if (response && response.errorCode) {
                console.error({ response });
                enqueueSnackbar(`Failed to hover ${championIdToName[championIdToHover]}! Maybe unowned?`, { variant: "warning" });
                currentState.current.isHovering = false;
                return false;
            }
            else {
                currentState.current.championId = championIdToHover;
                currentState.current.isHovering = false;
                enqueueSnackbar(`Hovered ${championIdToName[championIdToHover]}`, { variant: "success" });
                return true;
            }
        });
    };

    return (
        <ClientStateContext.Provider value={{
            phase: currentPhase,
            leftTeam: currentLeftTeam,
            rightTeam: currentRightTeam,
            localPlayerCellId: currentLocalPlayerCellId,
            bans: currentBans,
            predictions: currentPredictions,
            loadingPredictions: loadingPredictions,
            userTookControl: userTookControl,
            hoverChampion: userRequestedHoverChampion,
            setRoleSwap: (role: LolChampionSelectV1.Position) => setRoleSwappedWith(role)
        }}>
            {children}
        </ClientStateContext.Provider>
    );
}


export { ClientStateContext, ClientStateProvider };

const compareTeams = (a: LolChampionSelectV1.Team[], b: LolChampionSelectV1.Team[]) => {
    // iterate over each element in a and chech if it is in b
    for (let i = 0; i < a.length; i++) {
        const x = a[i];
        const found = b.find(y => y.championId === x.championId && y.assignedPosition === x.assignedPosition && y.championPickIntent === x.championPickIntent && y.summonerId === x.summonerId);
        if (found === undefined)
            return false;
    }

    return true;
}

const compareArrays = (a: any[], b: any[]) => a.length === b.length && a.every((value, index) => value === b[index]);