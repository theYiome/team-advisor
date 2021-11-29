import * as fsPromises from 'node:fs/promises';

export async function loadSetting(path="data/app-settings.json") {
    try {
        return loadJSON(path);
    }
    catch (err) {
        console.log(err);
        return {
            lockfileDirPath: "C:\\Riot Games\\League of Legends\\",
            lockfileFilename: "filename",
        };
    }
}

export async function saveSettings(settingsObject, path="data/app-settings.json") {
    saveJSON(settingsObject, path, 4);
}

export async function loadJSON(path) {
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path, "r");
        const fileData = await file.read();
        file.close();
        const buffer = fileData.buffer.slice(0, fileData.bytesRead);
        return JSON.parse(buffer);
    }
    catch (err) {
        console.log(err); 
        throw `Failed to load: ${path}`;
    }
}

export async function saveJSON(object, path, indent=0) {
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path, "w");
        file.write(JSON.stringify(object, null, indent));
        file.close();
    }
    catch (err) {
        const errorStr = `Failed to write to: ${path}`;
        console.warn(errorStr, err);
        throw errorStr;
    }
}