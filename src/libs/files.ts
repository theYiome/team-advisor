import * as fsPromises from 'node:fs/promises';


export async function loadString(path: string): Promise<string> {
    try {
        // https://nodejs.org/api/fs.html
        const file = await fsPromises.open(path, "r");
        const buffer = await file.readFile();
        // console.log(fileData, fileData.toJSON(), fileData.toString());
        // fileData.
        file.close();
        // const buffer = fileData.buffer.slice(0, fileData.bytesRead);
        return buffer.toString();
    }
    catch (err) {
        console.warn(err);
        throw `Failed to load: ${path}`;
    }
}


export async function loadJSON(path: string) {
    return JSON.parse(await loadString(path));
}


export async function saveJSON(object: any, path: string, indent = 0) {
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


function bufferToValidString(buffer: any) {
    // https://stackoverflow.com/questions/22809401/removing-a-null-character-from-a-string-in-javascript
    return buffer.toString().replace(/\0/g, '').trim();
}
