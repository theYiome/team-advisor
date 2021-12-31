import React, { ReactElement, FC, useState, useContext } from 'react';

import { Stack, Alert, AlertTitle, Button } from '@mui/material';

import { ChampionsContext } from './ChampionsContext';
import { PickEntry } from './common/PickEntry';
import { MultipleChampionPicker } from './common/ChampionRolePicker';


const filePath = "settings/teambuilder.settings.json";

const roles = ["top", "jungle", "middle", "bottom", "support"];

export const TeamBuilder: FC<any> = (): ReactElement => {
    const [banList, setBanList] = useState([]);

    const initialLeftTeam = roles.map(role => Object({ championName: null, roleName: role }));
    const initialRightTeam = roles.map(role => Object({ championName: null, roleName: role }));
    const [leftTeam, setLeftTeam] = useState(initialLeftTeam);
    const [rightTeam, setRightTeam] = useState(initialRightTeam);

    const [champions, setChampions] = useContext(ChampionsContext);

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();
    const availableChampionNames = championNames.filter(championName => !banList.includes(championName));

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
                <Alert severity="info">
                    <AlertTitle>How does it work?</AlertTitle>
                    It doesn't. Yet.
                </Alert>
            </Stack>
                <Button onClick={() => {}} variant="outlined">Make prediction</Button>
            <Stack>
                <MultipleChampionPicker
                    championNames={championNames}
                    currentList={banList}
                    patch={patch}
                    onChange={(newBanList) => setBanList(newBanList)}
                    label="Bans"
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
                            champions={availableChampionNames}
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
                            champions={availableChampionNames}
                            roles={roles}
                            onChange={(newChamionName: string, newRoleName: string) => onRightTeamEntryChange(newChamionName, newRoleName, index)}
                        />
                    ))}
                </Stack>
            </Stack>
        </Stack>
    );
}