import React, { useState, createContext, useContext, useEffect } from 'react';
import { SettingsContext } from '../Settings/SettingsProvider';
import * as files from '../../libs/files';
import { jsonLcuRequest } from "../../libs/lcuRequest";

interface Summoner {
    accountId: number;
    displayName: string;
    internalName: string;
    nameChangeFlag: boolean;
    percentCompleteForNextLevel: number;
    privacy: string;
    profileIconId: number;
    puuid: string;
    rerollPoints: RerollPoints;
    summonerId: number;
    summonerLevel: number;
    unnamed: boolean;
    xpSinceLastLevel: number;
    xpUntilNextLevel: number;
}

interface RerollPoints {
    currentPoints: number;
    maxRolls: number;
    numberOfRolls: number;
    pointsCostToRoll: number;
    pointsToReroll: number;
}

interface LcuCredentials {
    protocol: string,
    port: string,
    username: string,
    password: string
}

const initialState = {
    credentials: {
        protocol: "https",
        port: "",
        username: "riot",
        password: ""
    },
    valid: false,
    summoner: {
        accountId: 123456789,
        displayName: "",
        internalName: "",
        nameChangeFlag: false,
        percentCompleteForNextLevel: 50,
        privacy: "PUBLIC",
        profileIconId: 21,
        puuid: "abc123-abc123-abc123-abc123-abc123",
        rerollPoints: {
            currentPoints: 500,
            maxRolls: 2,
            numberOfRolls: 2,
            pointsCostToRoll: 250,
            pointsToReroll: 0
        },
        summonerId: 12345678,
        summonerLevel: 40,
        unnamed: false,
        xpSinceLastLevel: 1417,
        xpUntilNextLevel: 3360
    }
};

const LcuContext = createContext(initialState);

const LcuProvider: React.FC = ({ children }) => {
    const [lcuState, setLcuState] = useState(initialState);
    const [periodicUpdate, setPeriodicUpdate] = useState(null);
    const { settings } = useContext(SettingsContext);

    const getCredentialsFromLockfile = async () => {
        const lockfilePath = buildPath(settings.leagueInstallationPath, "lockfile");
        console.log({ lockfilePath });
        try {
            const fileData = await files.loadString(lockfilePath);
            const credentials = parseLockfile(fileData);
            if (!compareCredentials(credentials, lcuState.credentials) || !lcuState.valid) {
                const endpointName = "lol-summoner/v1/current-summoner";
                const summoner: Summoner = await jsonLcuRequest(credentials, endpointName);
                console.log({ credentials, valid: true, summoner });
                setLcuState({ credentials, valid: true, summoner });
            }
        } catch (err) {
            console.warn(err);
            if (lcuState.valid)
                setLcuState({ ...lcuState, valid: false });
        }
    }

    useEffect(() => {
        getCredentialsFromLockfile();
        if (periodicUpdate) {
            clearInterval(periodicUpdate);
        }
        setPeriodicUpdate(setInterval(getCredentialsFromLockfile, 10000));
        return () => clearInterval(periodicUpdate);
    }, [settings.leagueInstallationPath, lcuState.credentials, lcuState.valid]);

    useEffect(() => {
        const subtitleRef = document.getElementById("window-subtitle");
        if (lcuState.valid && lcuState?.summoner?.displayName?.length > 0)
            subtitleRef.innerHTML = `- <strong>${lcuState.summoner.displayName}</strong>`;
        else
            subtitleRef.innerHTML = "- not logged in";
    }, [lcuState]);

    return (
        <LcuContext.Provider value={lcuState}>
            {children}
        </LcuContext.Provider>
    );
}

const parseLockfile = (fileString: string): LcuCredentials => {
    const fileArray = fileString.split(":");

    console.log(fileArray);
    if (fileArray.length < 5) {
        throw `At least 5 strings required, ${fileArray.length} found. String is "${fileString}"`;
    }

    return {
        protocol: fileArray[4],
        port: fileArray[2],
        username: "riot",
        password: fileArray[3],
    }
}

const compareCredentials = (a: LcuCredentials, b: LcuCredentials) => (
    a.username === b.username &&
    a.password === b.password &&
    a.port === b.port &&
    a.protocol === b.protocol
);

const buildPath = (...args: string[]) => {
    return args.map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/[\/]*$/g, '');
        } else {
            return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
        }
    }).filter(x => x.length).join('/');
};

export { LcuContext, LcuProvider, LcuCredentials }