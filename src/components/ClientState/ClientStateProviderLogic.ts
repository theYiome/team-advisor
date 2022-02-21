import * as connections from '../../libs/connections'
import { rawLcuRequest, jsonLcuRequest } from '../../libs/lcuRequest';
import { Lcu, LolChampionSelectV1, LolMatchmakingV1ReadyCheck } from './ClientStateTypes';
import { LcuCredentials } from '../LcuProvider';

const compareTeams = (a: any[], b: any[]) => {
    return a.length === b.length && a.every((value, index) => (
        value.championId === b[index].championId &&
        value.championPickIntent === b[index].championPickIntent &&
        value.summonerId === b[index].summonerId &&
        value.assignedPosition === b[index].assignedPosition
    ));
};

const compareArrays = (a: any[], b: any[]) => a.length === b.length && a.every((value, index) => value === b[index]);

enum ClientPhase {
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
    phase: ClientPhase,
    queueTimer: number
}

const getQueueState = async (lockfileContent: LcuCredentials): Promise<QueueState> => {

    const { protocol, port, username, password } = lockfileContent;

    if (username === "") return {
        phase: ClientPhase.ClientClosed,
        queueTimer: 0
    }

    try {
        const endpointName = "lol-matchmaking/v1/ready-check";
        const urlWithAuth = connections.clientURL(port, password, username, protocol);
        const url = urlWithAuth + endpointName;

        const response: Lcu.Error & LolMatchmakingV1ReadyCheck.Session = await connections.fetchJSON(url);
        console.log(response);
        
        if (response.message === Lcu.Message.NotAttachedToMatchmakingQueue) return {
            phase: ClientPhase.ClientOpen,
            queueTimer: 0
        }

        const validResponse: LolMatchmakingV1ReadyCheck.Session = response;

        if (validResponse.state === LolMatchmakingV1ReadyCheck.State.Invalid) return {
            phase: ClientPhase.InQueue,
            queueTimer: 0
        }
        else if (validResponse.state === LolMatchmakingV1ReadyCheck.State.InProgress) {
            // Game has been found, check whats user response
            if (validResponse.playerResponse === LolMatchmakingV1ReadyCheck.PlayerResponse.Declined) return {
                phase: ClientPhase.GameDeclined,
                queueTimer: validResponse.timer
            }
            else if (validResponse.playerResponse === LolMatchmakingV1ReadyCheck.PlayerResponse.Accepted) return {
                phase: ClientPhase.GameAccepted,
                queueTimer: validResponse.timer
            }
            else return {
                phase: ClientPhase.GameFound,
                queueTimer: validResponse.timer
            }
        }
        else return {
            phase: ClientPhase.Unknown,
            queueTimer: 0
        }
    }
    catch (err) {
        console.warn(err);
        return {
            phase: ClientPhase.Error,
            queueTimer: 0
        }
    }
}

const getChampionSelectState = async (lockfileContent: LcuCredentials) => {

    const lobbyState = {
        phase: undefined as ClientPhase,
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
    };

    const endpointName = "lol-champ-select/v1/session";
    let response: LolChampionSelectV1.Session & Lcu.Error = null;
    try {
        response = await jsonLcuRequest(lockfileContent, endpointName);
    } catch (error) {
        console.warn(error);
        lobbyState.phase = ClientPhase.ClientClosed;
        return lobbyState;
    }

    if (response.message === Lcu.Message.NoActiveDelegate) {
        lobbyState.phase = ClientPhase.ClientOpen;
        return lobbyState;
    }

    const session: LolChampionSelectV1.Session = response;

    try {
        const playerTeamId = session.myTeam[0].team;
        const leftTeam = playerTeamId === 1 ? session.myTeam : session.theirTeam;
        const rightTeam = playerTeamId === 2 ? session.myTeam : session.theirTeam;

        for (const element of leftTeam)
            if (element.assignedPosition === LolChampionSelectV1.Position.Utility)
                element.assignedPosition = LolChampionSelectV1.Position.Support;

        for (const element of rightTeam)
            if (element.assignedPosition === LolChampionSelectV1.Position.Utility)
                element.assignedPosition = LolChampionSelectV1.Position.Support;

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


    if (session.timer.phase === LolChampionSelectV1.Phase.Planning) {
        lobbyState.phase = ClientPhase.Planning;
        return lobbyState;
    }

    const userActions = getUserActions(session);
    lobbyState.pickActionId = userActions.find(action => action.type === LolChampionSelectV1.ActionType.Pick).id;

    const uncompletedActions = userActions.filter(action => !action.completed);
    if (uncompletedActions.length < 1) {
        lobbyState.phase = ClientPhase.Done;
        return lobbyState;
    }

    let activeAction = uncompletedActions.find(action => action.isInProgress);

    if (!activeAction)
        lobbyState.phase = ClientPhase.InChampionSelect;
    else {
        lobbyState.currentActionId = activeAction.id;
        lobbyState.championId = activeAction.championId;

        if (activeAction.championId > 0)
            lobbyState.isHovering = true;

        if (activeAction.type === LolChampionSelectV1.ActionType.Ban)
            lobbyState.phase = ClientPhase.Banning;
        else if (activeAction.type === LolChampionSelectV1.ActionType.Pick)
            lobbyState.phase = ClientPhase.Picking;
        else
            lobbyState.phase = ClientPhase.Unknown;
    }

    return lobbyState;
}

const getLcuState = async (lockfileContent: LcuCredentials) => {
    const lcuState = {
        phase: undefined as ClientPhase,
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
        leftTeam: [] as LolChampionSelectV1.Team[],
        rightTeam: [] as LolChampionSelectV1.Team[]
    };

    let { phase, queueTimer } = await getQueueState(lockfileContent);

    lcuState.phase = phase;
    lcuState.queueTimer = queueTimer;

    if (phase === ClientPhase.ClientOpen) {
        const championSelectState = getChampionSelectState(lockfileContent);
        Object.assign(lcuState, championSelectState);
    }

    return lcuState;
}

async function hoverChampion(lockfileContent: LcuCredentials, actionId: number, championId: number) {
    const options = {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: { championId },
        json: true
    }
    return rawLcuRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}`, options);
}

const completeAction = async (lockfileContent: LcuCredentials, actionId: number) => {
    return rawLcuRequest(lockfileContent, `lol-champ-select/v1/session/actions/${actionId}/complete`, { method: "POST" });
}

const instantCompleteAction = async (lockfileContent: LcuCredentials, actionId: number, championId: number) => {
    hoverChampion(lockfileContent, actionId, championId).then((result) => completeAction(lockfileContent, actionId));
}

const getUserActions = (session: LolChampionSelectV1.Session) => {
    const actionsFlat: LolChampionSelectV1.Action[] = [];
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
            if (action.type === LolChampionSelectV1.ActionType.Ban && action.championId > 0)
                bans.push(action.championId as number);
        }
    }
    return bans;
}

const getPicks = (actions: Array<LolChampionSelectV1.Action[]>) => {
    const picks: number[] = [];
    for (const phase of actions) {
        for (const action of phase) {
            if (action.type === LolChampionSelectV1.ActionType.Pick && action.championId > 0)
                picks.push(action.championId as number);
        }
    }
    return picks;
}

export { ClientPhase, getLcuState, completeAction, hoverChampion };