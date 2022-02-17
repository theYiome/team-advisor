import { rawLcuRequest, jsonLcuRequest } from '../../libs/lcuRequest';

enum ChampionSelectPhase {
    NoClient,
    NoInChampionSelect,
    InChampionSelect,
    Planning,
    Banning,
    Picking,
    Done,
    Unknown,
    Error
}

async function getChampionSelectState(lockfileContent: any) {

    const lobbyState = {
        phase: undefined as ChampionSelectPhase,
        actionId: undefined as number,
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
    };

    const endpointName = "lol-champ-select/v1/session";
    let session = null;
    try {
        session = await jsonLcuRequest(lockfileContent, endpointName);
    } catch (error) {
        console.warn(error);
        lobbyState.phase = ChampionSelectPhase.NoClient;
        return lobbyState;
    }

    if (session.message === "No active delegate") {
        lobbyState.phase = ChampionSelectPhase.NoInChampionSelect;
        return lobbyState;
    }

    // parse non crutial state
    // console.log(session);
    try {
        const playerTeamId = session.myTeam[0].team;
        const leftTeam = playerTeamId === 1 ? session.myTeam : session.theirTeam;
        const rightTeam = playerTeamId === 2 ? session.myTeam : session.theirTeam;

        for (const element of leftTeam)
            if (element.assignedPosition === "utility")
                element.assignedPosition = "support";

        for (const element of rightTeam)
            if (element.assignedPosition === "utility")
                element.assignedPosition = "support";

        lobbyState.leftTeam = leftTeam;
        lobbyState.rightTeam = rightTeam;

        lobbyState.localPlayerCellId = session.localPlayerCellId;
        lobbyState.localPlayerTeamId = session.localPlayerCellId >= 5 ? 1 : 0;
        lobbyState.gameId = session.gameId,
        lobbyState.counter = session.counter;
        lobbyState.isDraft = !session.isCustomGame && session.hasSimultaneousBans && !session.hasSimultaneousPicks;

        lobbyState.bans = getBans(session);
        lobbyState.picks = getPicks(session);
    }
    catch (error) { console.warn(error) }


    if (session.timer.phase === "PLANNING") {
        lobbyState.phase = ChampionSelectPhase.Planning;
        return lobbyState;
    }

    const userActions = getUserActions(session);
    const uncompletedActions = userActions.filter(action => !action.completed);
    if (uncompletedActions.length < 1) {
        lobbyState.phase = ChampionSelectPhase.Done;
        return lobbyState;
    }

    let activeAction = uncompletedActions.find(action => action.isInProgress);

    if (!activeAction)
        lobbyState.phase = ChampionSelectPhase.InChampionSelect;
    else {
        lobbyState.actionId = activeAction.id;
        lobbyState.championId = activeAction.championId;

        if (activeAction.championId > 0)
            lobbyState.isHovering = true;

        if (activeAction.type === "ban")
            lobbyState.phase = ChampionSelectPhase.Banning;
        else if (activeAction.type === "pick")
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
    return rawLcuRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}`, options);
}

async function completeAction(lockfileContent: any, actionId: number) {
    return rawLcuRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}/complete`, { method: "POST" });
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

export { ChampionSelectPhase, getChampionSelectState, hoverChampion, completeAction, instantCompleteAction };