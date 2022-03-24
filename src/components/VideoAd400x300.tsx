import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

export const VideoAd400x300: React.FC = () => {

    return (
        <Box sx={{width: 400, height: 300}}>
            <Skeleton variant='rectangular' animation="wave" width={400} height={300}></Skeleton>
        </Box>
    );
}