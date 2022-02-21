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

const getLcuState = async (lockfileContent: LcuCredentials) => {
    const lcuState = {
        phase: ClientPhase.Unknown as ClientPhase,
        queueTimer: 0 as number,
        currentActionId: -1 as number,
        pickActionId: -1 as number,
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
    };

    let { phase, queueTimer } = await getQueueState(lockfileContent);

    lcuState.phase = phase;
    lcuState.queueTimer = queueTimer;

    if (phase === ClientPhase.ClientOpen) {
        const endpointName = "lol-champ-select/v1/session";
        let response: LolChampionSelectV1.Session & Lcu.Error = null;
        try {
            response = await jsonLcuRequest(lockfileContent, endpointName);
        } catch (error) {
            console.warn(error);
            lcuState.phase = ClientPhase.ClientClosed;
            return lcuState;
        }
    
        if (response.message === Lcu.Message.NoActiveDelegate) {
            lcuState.phase = ClientPhase.ClientOpen;
            return lcuState;
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
    
            lcuState.leftTeam = leftTeam;
            lcuState.rightTeam = rightTeam;
    
            lcuState.localPlayerCellId = session.localPlayerCellId;
            lcuState.localPlayerTeamId = session.localPlayerCellId >= 5 ? 1 : 0;
            lcuState.gameId = session.gameId;
            lcuState.counter = session.counter;
            lcuState.isDraft = !session.isCustomGame && session.hasSimultaneousBans && !session.hasSimultaneousPicks;
    
            lcuState.bans = getBans(session.actions);
            lcuState.picks = getPicks(session.actions);
        }
        catch (error) { console.warn(error) }
    
    
        if (session.timer.phase === LolChampionSelectV1.Phase.Planning) {
            lcuState.phase = ClientPhase.Planning;
            return lcuState;
        }
    
        const userActions = getUserActions(session);
        console.log({userActions, session})
        const pickAction = userActions.find(action => action.type === LolChampionSelectV1.ActionType.Pick);
        lcuState.pickActionId = pickAction ? pickAction.id : -1;
    
        const uncompletedActions = userActions.filter(action => !action.completed);
        if (uncompletedActions.length < 1) {
            lcuState.phase = ClientPhase.Done;
            return lcuState;
        }
    
        let activeAction = uncompletedActions.find(action => action.isInProgress);
    
        if (!activeAction)
            lcuState.phase = ClientPhase.InChampionSelect;
        else {
            lcuState.currentActionId = activeAction.id;
            lcuState.championId = activeAction.championId;
    
            if (activeAction.championId > 0)
                lcuState.isHovering = true;
    
            if (activeAction.type === LolChampionSelectV1.ActionType.Ban)
                lcuState.phase = ClientPhase.Banning;
            else if (activeAction.type === LolChampionSelectV1.ActionType.Pick)
                lcuState.phase = ClientPhase.Picking;
            else
                lcuState.phase = ClientPhase.Unknown;
        }
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
    hoverChampion(lockfileContent, actionId, championId).then(result => completeAction(lockfileContent, actionId));
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