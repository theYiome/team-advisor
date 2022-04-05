import { app, getCurrentWindow } from '@electron/remote';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MaximizeIcon from '@mui/icons-material/Maximize';
import MinimizeIcon from '@mui/icons-material/Minimize';
import LogoutIcon from '@mui/icons-material/Logout';
import {version} from '../../package.json';

const win = getCurrentWindow();

// When document has loaded, initialise
// document.onreadystatechange = (event) => {
//     if (document.readyState == "complete") {
//         console.log("Document ready");
//     }
// };

// window.onbeforeunload = (event) => {
//     /* If window is reloaded, remove win event listeners
//     (DOM element listeners get auto garbage collected but not
//     Electron win listeners as the win is not dereferenced unless closed) */
//     win.removeAllListeners();
// }

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

const TitleBar = ({title = "Team Advisor"}) => {
    
    // Titlebar with minimize, maximize and close buttons using MUI
    return (
        <Paper elevation={0} sx={{filter: "opacity(85%)"}} className="drag-region">
            <Stack direction="row">
                <Box sx={{width: 1, userSelect: "none"}}>
                    <Box sx={{mt: 0.6, ml: 1}}>
                            {title} {version ? `v${version}` : ""}
                    </Box>
                </Box>
                <Stack direction="row" className="no-drag-region">
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
                            <MaximizeIcon />
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