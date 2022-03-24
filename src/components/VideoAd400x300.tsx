import React, { useState } from 'react';
import { Skeleton } from '@mui/material';

export const VideoAd400x300: React.FC = () => {

    return (
        <Skeleton variant='rectangular' animation="wave" width={400} height={300}></Skeleton>
    );
}