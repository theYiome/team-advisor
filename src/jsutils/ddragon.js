import * as connections from '../libs/connections';


export async function ddragonVersions() {
    const ddragonVersionsURL = "https://ddragon.leagueoflegends.com/api/versions.json";
    return connections.fetchJSON(ddragonVersionsURL);
}

export async function ddragonChampions(patch) {
    const ddragonChampionURL = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;

    try {

        const ddragonData = await connections.fetchJSON(ddragonChampionURL);
        
        const output = {
            patch: ddragonData.version
        }
    
        // creates object {"103": "Ahri", "1": "Annie", ...}
        for (const [key, value] of Object.entries(ddragonData.data)) {
            const id = value.key;
            output[id] = key;
        }
        console.log(output);
        return output;

    } catch (err) {
        console.warn(err);
        throw err;
    }

}