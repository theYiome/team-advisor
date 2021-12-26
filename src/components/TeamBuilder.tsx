import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete, Box } from '@mui/material';

import * as files from '../libs/files';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { PickEntry } from './PickEntry';
import { noClientMessage, errorStateMessage } from './CommonMessages';
import { ChampionSelectPhase, getChampionSelectState, hoverChampion } from '../componentLibs/championSelect';
import { appInControl, banningMessage, inChampionSelectMessage, noInChampionSelectMessage, pickedMessage, pickingMessage, planningMessage, unknownMessage, userInControl } from './ChampionSelectMessages';

const filePath = "settings/teambuilder.settings.json";

const roles = ["top", "jungle", "middle", "bottom", "support"];

export const TeamBuilder: FC<any> = (): ReactElement => {
    const [banList, setBanList] = useState([]);

    const initialLeftTeam = roles.map(role => Object({ championName: null, roleName: role }));
    const initialRightTeam = roles.map(role => Object({ championName: null, roleName: role }));
    const [leftTeam, setLeftTeam] = useState(initialLeftTeam);
    const [rightTeam, setRightTeam] = useState(initialRightTeam);

    const [champions, setChampions] = useContext(ChampionsContext);

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).filter(championName => !banList.includes(championName)).sort();
    const patch = champions["patch"];

    const onLeftTeamEntryChange = (newChamionName: string, newRoleName: string, index: number) => {
        console.log("left", index, newChamionName, newRoleName);
        const newTeam = [...leftTeam];
        newTeam[index].championName = newChamionName;
        newTeam[index].roleName = newRoleName;
        setLeftTeam(newTeam);
    };

    const onRightTeamEntryChange = (newChamionName: string, newRoleName: string, index: number) => {
        console.log("right", index, newChamionName, newRoleName);
        const newTeam = [...rightTeam];
        newTeam[index].championName = newChamionName;
        newTeam[index].roleName = newRoleName;
        setRightTeam(newTeam);
    };

    return (
        <Stack spacing={3}>
            <Stack>
                <Autocomplete
                    multiple
                    options={championNames}
                    value={banList}
                    onChange={(event, newValue) => setBanList(newValue)}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <img loading="lazy" width="20" src={avatarURI(patch, option)} alt={option} />
                            {option.toString()}
                        </Box>
                    )}
                    renderInput={(params) => <TextField {...params} variant="standard" label="Bans" />}
                />
            </Stack>
            <Stack direction="row" spacing={3}>
                <Stack spacing={2} sx={{ width: 1 }}>
                    {leftTeam.map((entry, index) => (
                        <PickEntry
                            key={index}
                            championName={entry.championName}
                            roleName={entry.roleName}
                            patch={patch}
                            champions={championNames}
                            roles={roles}
                            onChange={(newChamionName: string, newRoleName: string) => onLeftTeamEntryChange(newChamionName, newRoleName, index)}
                        />
                    ))}
                </Stack>

                <Stack spacing={2} sx={{ width: 1 }}>
                    {rightTeam.map((entry, index) => (
                        <PickEntry
                            key={index}
                            championName={entry.championName}
                            roleName={entry.roleName}
                            patch={patch}
                            champions={championNames}
                            roles={roles}
                            onChange={(newChamionName: string, newRoleName: string) => onRightTeamEntryChange(newChamionName, newRoleName, index)}
                        />
                    ))}
                </Stack>
            </Stack>
            <Stack>
                <Alert severity="info">
                    <AlertTitle>How does it work?</AlertTitle>
                    Don't know yet.
                </Alert>
            </Stack>
        </Stack>
    );
}

function avatarURI(patch: string, championName: string) {
    return `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championName}.png`;
}