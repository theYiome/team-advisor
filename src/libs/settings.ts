import * as files from './files';

export async function loadSetting(path="data/app-settings.json") {
    try {
        return files.loadJSON(path);
    }
    catch (err) {
        console.log(err);
        return {
            lockfileDirPath: "C:\\Riot Games\\League of Legends\\",
            lockfileFilename: "filename",
        };
    }
}

export async function saveSettings(settingsObject: any, path="data/app-settings.json") {
    files.saveJSON(settingsObject, path, 4);
}


