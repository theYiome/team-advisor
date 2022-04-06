import { app, getCurrentWindow } from '@electron/remote';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import MinimizeIcon from '@mui/icons-material/Minimize';
import LogoutIcon from '@mui/icons-material/Logout';

const win = getCurrentWindow();

const appVersion = process?.env?.npm_package_version || app.getVersion();

const handleWindowQuit = () => {
    win.destroy();
    app.quit();
}

const handleWindowMinimize = () => {
    win.minimize();
}

const handleWindowMaximize = () => {
    if (win.isMaximized())
        win.unmaximize();
    else 
        win.maximize();
}

const handleWindowClose = () => {
    win.close();
}

const TitleBar = ({title = "", subtitle = ""}) => {
    
    // Titlebar with minimize, maximize and close buttons using MUI
    return (
        <Paper elevation={0} sx={{filter: "opacity(85%)"}}>
            <Stack direction="row">
                <Box sx={{width: 1, userSelect: "none"}} className="drag-region">
                    <Box sx={{mt: 0.6, ml: 1}}>
                        <Typography>
                            {title} {appVersion ? `v${appVersion}` : ""} {subtitle && subtitle !== "" ? `- ${subtitle}` : ""}
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Quit application">
                        <IconButton size="small" aria-label="quit" color='error' onClick={handleWindowQuit}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Minimize">                        
                        <IconButton size="small" aria-label="minimize" onClick={handleWindowMinimize}>
                            <MinimizeIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Maximize">
                        <IconButton size="small" aria-label="maximize" onClick={handleWindowMaximize}>
                            <CropSquareIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Minimize to system tray">
                        <IconButton size="small" aria-label="close" onClick={handleWindowClose}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </Paper>
    );
}

export { TitleBar };