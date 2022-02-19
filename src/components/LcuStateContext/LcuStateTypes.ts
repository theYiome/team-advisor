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
    
    enum ActionType {
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
        phase:                   "PLANNING" | "BAN_PICK" | "FINALIZATION";
        totalTimeInPhase:        number;
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
        playerResponse: string;
        state:          string;
        suppressUx:     boolean;
        timer:          number;
    }    
}

export interface LcuErrorMessage {
    errorCode:  string | "RPC_ERROR" | "RESOURCE_NOT_FOUND";
    httpStatus: number;
    message:    string | "Not attached to a matchmaking queue." | "Invalid URI format";
}