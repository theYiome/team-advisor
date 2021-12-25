import React, { ReactElement, FC, useState, useContext, useEffect } from 'react';

import Container from '@mui/material/Container'
import { Button, TextField, Typography, Stack, Slider, Alert, AlertTitle, Switch, FormControlLabel, Autocomplete } from '@mui/material';

import * as files from '../libs/files';

import { LockfileContext } from './LockfileContext';
import { ChampionsContext } from './ChampionsContext';

import { PickEntry } from './PickEntry';
import { noClientMessage, errorStateMessage } from './CommonMessages';
import { ChampionSelectPhase, getChampionSelectState, hoverChampion } from '../componentLibs/championSelect';
import { appInControl, banningMessage, inChampionSelectMessage, noInChampionSelectMessage, pickedMessage, pickingMessage, planningMessage, unknownMessage, userInControl } from './ChampionSelectMessages';

const filePath = "settings/teambuilder.settings.json";

export const TeamBuilder: FC<any> = (): ReactElement => {
    const [banList, setBanList] = useState([]);
    
    const [champions, setChampions] = useContext(ChampionsContext);
    
    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();

    return (
        <Stack spacing={3}>
            <Stack>
                <Autocomplete
                    multiple
                    options={championNames}
                    value={banList}
                    onChange={(event, newValue) => setBanList(newValue)}
                    renderInput={(params) => <TextField {...params} variant="standard" label="Bans"/>}
                />
            </Stack>
            <Stack direction="row" spacing={3}>
                <Stack spacing={2} sx={{width: 1}}>
                    <PickEntry championId={1} role={"top"} isPlayer={false}/>
                </Stack>

                <Stack spacing={2} sx={{width: 1}}>
                    <PickEntry championId={10} role={"middle"} isPlayer={false}/>
                    <PickEntry championId={22} role={"botlane"} isPlayer={false}/>
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