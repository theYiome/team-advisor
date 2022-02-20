import * as connections from './connections';

export interface ChampionData {
    [key: string]: string | undefined
}

namespace Data {
    export interface DdragonChampionData {
        type:    string;
        format:  string;
        version: string;
        data:    { [key: string]: ChampionFullData };
    }
    
    interface ChampionFullData {
        version: string;
        id:      string;
        key:     string;
        name:    string;
        title:   string;
        blurb:   string;
        info:    Info;
        image:   Image;
        tags:    Tag[];
        partype: string;
        stats:   { [key: string]: number };
    }
    
    interface Image {
        full:   string;
        sprite: string;
        group:  string;
        x:      number;
        y:      number;
        w:      number;
        h:      number;
    }
    
    export interface Info {
        attack:     number;
        defense:    number;
        magic:      number;
        difficulty: number;
    }
    
    export enum Tag {
        Assassin = "Assassin",
        Fighter = "Fighter",
        Mage = "Mage",
        Marksman = "Marksman",
        Support = "Support",
        Tank = "Tank",
    }
}

export async function ddragonVersions() {
    const ddragonVersionsURL = "https://ddragon.leagueoflegends.com/api/versions.json";
    return connections.fetchJSON(ddragonVersionsURL) as unknown as string[];
}

export async function ddragonChampions(patch: string) {
    const ddragonChampionURL = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;

    try {

        const ddragonData: Data.DdragonChampionData = await connections.fetchJSON(ddragonChampionURL);
        
        const output: ChampionData = {
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