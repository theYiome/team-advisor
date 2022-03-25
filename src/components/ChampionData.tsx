import React, { useContext } from 'react';
import { Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { ChampionsContext } from './ChampionProvider';
import { avatarURI } from '../componentLibs/leagueImages';

export const ChampionData: React.FC = () => {
    const { championNameToId, patch } = useContext(ChampionsContext);

    return (
        <Container>
            <Stack spacing={3}>
                <Typography variant='h6'>Champions in patch <strong>{patch}</strong></Typography>

                <TableContainer>
                    <Table sx={{ width: 1, fontSize: 1 }} size="small" aria-label="champion names and ids list">
                        <TableHead>
                            <TableRow>
                                <TableCell>avatar</TableCell>
                                <TableCell>key</TableCell>
                                <TableCell>value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                Object.keys(championNameToId).reverse().map((key: string) => (
                                    <TableRow key={key}>
                                        <TableCell component="th" scope="row">
                                            <img loading="lazy" width="36" src={avatarURI(patch, key)} alt={key} />
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {key}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {championNameToId[key]}
                                        </TableCell>
                                    </TableRow>)
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Container>
    );
}

