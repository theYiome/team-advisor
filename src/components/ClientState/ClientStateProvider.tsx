import React, { useState, useContext, useEffect, createContext, useRef } from 'react';

import { useSnackbar } from 'notistack';
import { LcuContext } from '../LcuProvider';

import { ChampionsContext } from '../ChampionProvider';
import { completeAction, getLcuState, hoverChampion, ClientPhase } from './ClientStateProviderLogic';
import { Lcu, LolChampionSelectV1 } from './ClientStateTypes';
import { SettingsContext } from '../Settings/SettingsProvider';
import * as connections from '../../libs/connections';


export const ClientStateContext = createContext({
    phase: ClientPhase.Unknown,
    leftTeam: [] as LolChampionSelectV1.Team[],
    rightTeam: [] as LolChampionSelectV1.Team[],
    localPlayerCellId: 0,
    championId: 0,
    bans: [] as number[],
    predictions: [] as number[],
    loadingPredictions: false,
    getPredictions: async (endpoint: string) => [1, 2, 3],
    hoverChampion: async (championId: number) => true
});

export const ClientStateProvider: React.FC = ({ children }) => {

    const verySlowUpdateInterval = 4000;
    const slowUpdateInterval = 2000;
    const fastUpdateInterval = 300;

    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(verySlowUpdateInterval);

    
    const lcuState = useContext(LcuContext);
    const champions = useContext(ChampionsContext);
    const { settingsState, settingsDispatch } = useContext(SettingsContext);
    
    const currentState = useRef({
        phase: undefined as ClientPhase,
        queueTimer: undefined as number,
        
        actionTimer: new Date() as Date,
        failedToHover: [] as number[],
        predictions: [] as number[],
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
    const [roleSwappedWith, setRoleSwappedWith] = useState("");

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

        // console.log({ elapsed: elapsedTimeSinceLastAction() });

        if (!lcuState.valid)
            currentState.current.phase = ClientPhase.ClientClosed;


        getLcuState(lcuState.credentials).then((state) => {
            {
                if(currentPhase !== state.phase)
                    setCurrentPhase(state.phase);
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

            // check if worth updating
            if ([ClientPhase.Planning, ClientPhase.Banning, ClientPhase.Picking, ClientPhase.InChampionSelect].includes(state.phase)) {

                const championId = state.championId;
                const picks = state.picks;
                const bans = state.bans;

                const unavailableChampions = bans.concat(picks)
                    .concat(currentState.current.failedToHover)
                    .filter(unavailable => unavailable !== championId);

                // const allPlayers = state.leftTeam.concat(state.rightTeam);
                // const user = allPlayers.find(x => (x.cellId === state.localPlayerCellId));
                // const roleFromChampionSelect = user ? user.assignedPosition : "";
                // let preferredChampionList: string[] = settingsState.favourites[roleFromChampionSelect];
                // const preferredChampionIdList: number[] = preferredChampionList.map(name => parseInt(champions[name]));

                const attemptToHover = (championIdToHover: number) => {
                    if (championIdToHover && championIdToHover !== championId) {

                        if (currentState.current.championId !== championId)
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
                    currentState.current.championId !== championId &&
                    currentState.current.championId !== 0 && championId !== 0;

                currentState.current.championId = championId;

                if (!currentState.current.userTookControl) {
                    // if control not taken app can perform an action
                    if (isInBanningPhase) {
                        const idBanList: number[] = settingsState.prefferedBans.map(name => parseInt(champions[name]));
                        const championToBan: number = idBanList.find(ban => !unavailableChampions.includes(ban));
                        attemptToHover(championToBan);
                    }
                }

                // if no champion is hovered in picking phase, hover something
                if (isInPickingPhase) {
                    if (currentState.current.predictions.length > 0 && championId === 0) {
                        const championToPick = currentState.current.predictions.find(pick => !unavailableChampions.includes(pick));
                        // console.log({ allPlayers, user, roleFromChampionSelect, championList: preferredChampionList, unavailableChampions, choosenChampion: championToPick });
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

        setPeriodicUpdate(setInterval(updateFunction, updateInterval));

        return () => clearInterval(periodicUpdate);
    }, [updateInterval]);

    // clearing state when turned off
    useEffect(() => {
        currentState.current.actionTimer = new Date();
    }, [settingsState.autoAccept, settingsState.autoBan, settingsState.autoPick]);

    useEffect(() => {
        if(currentPhase === ClientPhase.ClientClosed) {
            if(updateInterval !== verySlowUpdateInterval)
                setUpdateInterval(verySlowUpdateInterval);
        }
        if([ClientPhase.InQueue, ClientPhase.GameFound, ClientPhase.Picking].includes(currentPhase)) {
            if(updateInterval !== fastUpdateInterval)
                setUpdateInterval(fastUpdateInterval);
        }
        else if (updateInterval !== slowUpdateInterval)
            setUpdateInterval(slowUpdateInterval)
    }, [currentPhase]);


    const getPredictions = async (endpoint: string) => {
        setLoadingPredictions(true);

        // do role swap if selected by the user
        if (roleSwappedWith !== "") {
            const allPlayers = currentState.current.leftTeam.concat(currentState.current.rightTeam);
            const user = allPlayers.find(x => (x.cellId === currentState.current.localPlayerCellId));
            const userRole = user ? user.assignedPosition : "";

            if (roleSwappedWith !== userRole)
                currentState.current.localPlayerTeamId === 0 ? 
                swapRolesInTeam(userRole, roleSwappedWith, currentState.current.leftTeam) : 
                swapRolesInTeam(userRole, roleSwappedWith, currentState.current.rightTeam);
        }

        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: { 
                leftTeam: currentState.current.leftTeam, 
                rightTeam: currentState.current.rightTeam,
                bans: currentState.current.bans, 
                localPlayerCellId: currentState.current.localPlayerCellId,
                localPlayerTeamId: currentState.current.localPlayerTeamId,
                preferredChampionList: settingsState.favourites.top
            },
            json: true
        }

        console.log(options);

        try {
            const response = await connections.fetchJSON(endpoint, options);
            console.log({ response, options, type: typeof (response) });
            const content = response["sorted_champion_ids"];
            setLoadingPredictions(false);
            if (content)
                return content;
            else
                return [];
        }
        catch (error) {
            setLoadingPredictions(false);
            console.warn(error);
            return [];
        }
    }


    return (
        <ClientStateContext.Provider value={{
            phase: currentPhase,
            leftTeam: currentLeftTeam,
            rightTeam: currentRightTeam,
            localPlayerCellId: currentLocalPlayerCellId,
            championId: currentChampionId,
            bans: currentBans,
            predictions: [] as number[],
            loadingPredictions: false,
            getPredictions: getPredictions,
            hoverChampion: async (championId: number) => true
        }}>
        </ClientStateContext.Provider>
    );
}