import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#195ad2',
        },
    },
    shape: {
        borderRadius: 8,
    }
});

const lightRedTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#ff4b4b',
        },
    },
    shape: {
        borderRadius: 8,
    }
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#195ad2',
        },
        secondary: {
            main: '#000',
        },
        background: {
            default: '#040404',
            paper: '#070707',
        },
        text: {
            primary: '#FFF',
            secondary: '#FFF'
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        allVariants: {
            color: "#EEE"
        }
    }
});

const darkRedTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ff4b4b',
        },
        secondary: {
            main: '#000',
        },
        background: {
            default: '#040404',
            paper: '#070707',
        },
        text: {
            primary: '#FFF',
            secondary: '#FFF'
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        allVariants: {
            color: "#EEE"
        }
    }
});

const darkishRedTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ff4b4b',
        },
        secondary: {
            main: '#000',
        },
        background: {
            default: '#0e1117',
            paper: '#262730',
        },
        text: {
            primary: '#FFF',
            secondary: '#FFF'
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        allVariants: {
            color: "#EEE"
        }
    }
});

const themesMap = {
    "Dark": darkTheme,
    "Dark Red": darkRedTheme,
    "Darkish Red": darkishRedTheme,
    "Light": lightTheme,
    "Light Red": lightRedTheme
};

type AppTheme = keyof typeof themesMap;

export { themesMap, AppTheme };