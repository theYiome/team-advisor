import { rawClientRequest, jsonClientRequest } from './clientConnection';

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

async function getChampionSelectState(lockfileContent: any) {

    const lobbyState = { 
        phase: undefined as ChampionSelectPhase,
        actionId: undefined as number,
        championId: 0 as number,
        counter: undefined as number,
        picks: undefined as number[],
        bans: undefined as number[]
    };
    
    const endpointName = "lol-champ-select/v1/session";
    let session = null;
    try {
        session = await jsonClientRequest(lockfileContent, endpointName);
    } catch(error) {
        console.warn(error);
        lobbyState.phase = ChampionSelectPhase.NoClient;
        return lobbyState;
    }

    console.log(session);

    if (session.message === "No active delegate") {
        lobbyState.phase = ChampionSelectPhase.NoInLobby;
        return lobbyState;
    }

    const counter = session.counter as number;
    lobbyState.counter = counter;

    if (session.timer.phase === "PLANNING") {
        lobbyState.phase = ChampionSelectPhase.Planning;
        return lobbyState;
    }

    const bans = getBans(session);
    lobbyState.bans = bans;

    const picks = getPicks(session);
    lobbyState.picks = picks;

    const userActions = getUserActions(session);
    const uncompletedActions = userActions.filter(action => !action.completed);
    if(uncompletedActions.length < 1) {
        lobbyState.phase = ChampionSelectPhase.Picked;
        return lobbyState;
    }

    let activeAction = uncompletedActions.find(action => action.isInProgress);

    if (!activeAction)
        lobbyState.phase = ChampionSelectPhase.InLobby;
    else {
        lobbyState.actionId = activeAction.id;
        lobbyState.championId = activeAction.championId;
        const isHovering = activeAction.championId > 0;
        
        if(activeAction.type === "ban") 
            if(isHovering) 
                lobbyState.phase = ChampionSelectPhase.BanHovered;
            else 
                lobbyState.phase = ChampionSelectPhase.Banning;
        else 
        if (activeAction.type === "pick")
            if(isHovering) 
                lobbyState.phase = ChampionSelectPhase.PickHovered;
            else 
                lobbyState.phase = ChampionSelectPhase.Picking;
        else
            lobbyState.phase = ChampionSelectPhase.Unknown;
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
    return rawClientRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}`, options);
}

async function completeAction(lockfileContent: any, actionId: number) {
    return rawClientRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}/complete`, { method: "POST" });
}

function instantCompleteAction(lockfileContent: any, actionId: number, championId: number) {
    hoverChampion(lockfileContent, actionId, championId).then((result) => completeAction(lockfileContent, actionId));
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

export { ChampionSelectPhase, getChampionSelectState, hoverChampion, completeAction, instantCompleteAction, };