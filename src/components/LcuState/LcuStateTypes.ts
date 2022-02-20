export namespace LolChampionSelectV1 {

    export interface Session {
        actions:              Array<Action[]>;
        allowBattleBoost:     boolean;
        allowDuplicatePicks:  boolean;
        allowLockedEvents:    boolean;
        allowRerolling:       boolean;
        allowSkinSelection:   boolean;
        bans:                 Bans;
        benchChampionIds:     number[];
        benchEnabled:         boolean;
        boostableSkinCount:   number;
        chatDetails:          ChatDetails;
        counter:              number;
        entitledFeatureState: EntitledFeatureState;
        gameId:               number;
        hasSimultaneousBans:  boolean;
        hasSimultaneousPicks: boolean;
        isCustomGame:         boolean;
        isSpectating:         boolean;
        localPlayerCellId:    number;
        lockedEventIndex:     number;
        myTeam:               Team[];
        recoveryCounter:      number;
        rerollsRemaining:     number;
        skipChampionSelect:   boolean;
        theirTeam:            Team[];
        timer:                Timer;
        trades:               Trade[];
    }
    
    export interface Action {
        actorCellId:  number;
        championId:   number;
        completed:    boolean;
        id:           number;
        isAllyAction: boolean;
        isInProgress: boolean;
        type:         ActionType;
    }
    
    export enum ActionType {
        Ban = "ban",
        Pick = "pick",
        TenBansReveal = "ten_bans_reveal",
    }
    
    interface Bans {
        myTeamBans:    number[];
        numBans:       number;
        theirTeamBans: number[];
    }
    
    interface ChatDetails {
        chatRoomName:     string;
        chatRoomPassword: string | null;
    }
    
    interface EntitledFeatureState {
        additionalRerolls: number;
        unlockedSkinIds:   number[];
    }
    
    interface Team {
        assignedPosition:    string;
        cellId:              number;
        championId:          number;
        championPickIntent:  number;
        entitledFeatureType: EntitledFeatureType;
        selectedSkinId:      number;
        spell1Id:            number;
        spell2Id:            number;
        summonerId:          number;
        team:                number;
        wardSkinId:          number;
    }
    
    enum EntitledFeatureType {
        Empty = "",
        None = "NONE",
    }
    
    interface Timer {
        adjustedTimeLeftInPhase: number;
        internalNowInEpochMs:    number;
        isInfinite:              boolean;
        phase:                   Phase;
        totalTimeInPhase:        number;
    }

    export enum Phase {
        Planning = "PLANNING",
        BanPick = "BAN_PICK",
        Finalization = "FINALIZATION"
    }
    
    interface Trade {
        cellId: number;
        id:     number;
        state:  string;
    }
}

export namespace LolMatchmakingV1ReadyCheck {
    export interface Session {
        declinerIds:    number[];
        dodgeWarning:   string;
        playerResponse: PlayerResponse;
        state:          State;
        suppressUx:     boolean;
        timer:          number;
    }

    export enum PlayerResponse {
        Accepted = "Accepted",
        Declined = "Declined"
    }

    export enum State {
        Invalid = "Invalid",
        InProgress = "InProgress"
    }
}

export namespace Lcu {

    export interface Error {
        errorCode:  ErrorCode;
        httpStatus: number;
        message:    Message;
    }
    
    export enum ErrorCode {
        RpcError = "RPC_ERROR",
        ResourceNotFound = "RESOURCE_NOT_FOUND"
    }
    
    export enum Message {
        NotAttachedToMatchmakingQueue = "Not attached to a matchmaking queue.",
        InvalidUriFormat = "Invalid URI format",
        NoActiveDelegate = "No active delegate"
    }
}