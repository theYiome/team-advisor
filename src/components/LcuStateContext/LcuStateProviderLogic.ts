import * as connections from '../../libs/connections'
import { rawLcuRequest, jsonLcuRequest } from '../../libs/lcuRequest';
import { LcuErrorMessage, LolChampionSelectV1, LolMatchmakingV1ReadyCheck } from './LcuStateTypes';

const compareTeams = (a: any[], b: any[]) => {
    return a.length === b.length && a.every((value, index) => (
        value.championId === b[index].championId &&
        value.championPickIntent === b[index].championPickIntent &&
        value.summonerId === b[index].summonerId &&
        value.assignedPosition === b[index].assignedPosition
    ));
};

const compareArrays = (a: any[], b: any[]) => a.length === b.length && a.every((value, index) => value === b[index]);

enum LcuPhase {
    ClientClosed,
    ClientOpen,
    InQueue,
    GameFound,
    GameDeclined,
    GameAccepted,
    Planning,
    Banning,
    InChampionSelect,
    Picking,
    Done,
    Unknown,
    Error
}

type QueueState = {
    phase: LcuPhase,
    queueTimer: number
}

const getQueueState = async (lockfileContent: any): Promise<QueueState> => {

    const { protocol, port, username, password } = lockfileContent;

    if (username === "") return {
        phase: LcuPhase.ClientClosed,
        queueTimer: 0
    }

    try {
        const endpointName = "lol-matchmaking/v1/ready-check";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const response: LcuErrorMessage & LolMatchmakingV1ReadyCheck.Session = await connections.fetchJSON(url);
        console.log(response);

        if (response.message === "Not attached to a matchmaking queue.") return {
            phase: LcuPhase.ClientOpen,
            queueTimer: 0
        }

        const validResponse: LolMatchmakingV1ReadyCheck.Session = response;

        if (validResponse.state === "Invalid") return {
            phase: LcuPhase.InQueue,
            queueTimer: 0
        }
        else if (validResponse.state === "InProgress") {
            // Game has been found, check whats user response
            if (validResponse.playerResponse === "Declined") return {
                phase: LcuPhase.GameDeclined,
                queueTimer: validResponse.timer
            }
            else if (validResponse.playerResponse === "Accepted") return {
                phase: LcuPhase.GameAccepted,
                queueTimer: validResponse.timer
            }
            else return {
                phase: LcuPhase.GameFound,
                queueTimer: validResponse.timer
            }
        }
        else return {
            phase: LcuPhase.Unknown,
            queueTimer: 0
        }
    }
    catch (err) {
        console.warn(err);
        return {
            phase: LcuPhase.Error,
            queueTimer: 0
        }
    }
}

const getChampionSelectState = async (lockfileContent: any) => {

    const lobbyState = {
        phase: undefined as LcuPhase,
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
    };

    const endpointName = "lol-champ-select/v1/session";
    let response: LolChampionSelectV1.Session & LcuErrorMessage = null;
    try {
        response = await jsonLcuRequest(lockfileContent, endpointName);
    } catch (error) {
        console.warn(error);
        lobbyState.phase = LcuPhase.ClientClosed;
        return lobbyState;
    }

    if (response.message === "No active delegate") {
        lobbyState.phase = LcuPhase.ClientOpen;
        return lobbyState;
    }

    const session: LolChampionSelectV1.Session = response;

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

        lobbyState.bans = getBans(session.actions);
        lobbyState.picks = getPicks(session.actions);
    }
    catch (error) { console.warn(error) }


    if (session.timer.phase === "PLANNING") {
        lobbyState.phase = LcuPhase.Planning;
        return lobbyState;
    }

    const userActions = getUserActions(session);
    lobbyState.pickActionId = userActions.find(action => action.type === "pick");

    const uncompletedActions = userActions.filter(action => !action.completed);
    if (uncompletedActions.length < 1) {
        lobbyState.phase = LcuPhase.Done;
        return lobbyState;
    }

    let activeAction = uncompletedActions.find(action => action.isInProgress);

    if (!activeAction)
        lobbyState.phase = LcuPhase.InChampionSelect;
    else {
        lobbyState.currentActionId = activeAction.id;
        lobbyState.championId = activeAction.championId;

        if (activeAction.championId > 0)
            lobbyState.isHovering = true;

        if (activeAction.type === "ban")
            lobbyState.phase = LcuPhase.Banning;
        else if (activeAction.type === "pick")
            lobbyState.phase = LcuPhase.Picking;
        else
            lobbyState.phase = LcuPhase.Unknown;
    }

    return lobbyState;
}

const getLcuState = async (lockfileContent: any) => {
    const lcuState = {
        phase: undefined as LcuPhase,
        queueTimer: undefined as number,
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
    };

    let { phase, queueTimer } = await getQueueState(lockfileContent);

    lcuState.phase = phase;
    lcuState.queueTimer = queueTimer;

    if (phase === LcuPhase.ClientOpen) {
        const championSelectState = getChampionSelectState(lockfileContent);
        Object.assign(lcuState, championSelectState);
    }

    return lcuState;
}

async function hoverChampion(lockfileContent: any, actionId: number, championId: number) {
    const options = {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: { championId },
        json: true
    }
    return rawLcuRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}`, options);
}

const completeAction = async (lockfileContent: any, actionId: number) => {
    return rawLcuRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}/complete`, { method: "POST" });
}

const instantCompleteAction = async (lockfileContent: any, actionId: number, championId: number) => {
    hoverChampion(lockfileContent, actionId, championId).then((result) => completeAction(lockfileContent, actionId));
}

const getUserActions = (session: any) => {
    const actionsFlat = [];
    for (const actionSection of session.actions) {
        for (const action of actionSection) {
            actionsFlat.push(action);
        }
    }
    return actionsFlat.filter(action => session.localPlayerCellId === action.actorCellId).sort((a, b) => a.id - b.id);
}

const getBans = (actions: Array<LolChampionSelectV1.Action[]>) => {
    const bans: number[] = [];
    for (const phase of actions) {
        for (const action of phase) {
            if (action.type === "ban" && action.championId > 0)
                bans.push(action.championId as number);
        }
    }
    return bans;
}

const getPicks = (actions: Array<LolChampionSelectV1.Action[]>) => {
    const picks: number[] = [];
    for (const phase of actions) {
        for (const action of phase) {
            if (action.type === "pick" && action.championId > 0)
                picks.push(action.championId as number);
        }
    }
    return picks;
}

const roleToChampionList: any = {
    "top": [],
    "jungle": [],
    "middle": [],
    "bottom": [],
    "support": []
};
