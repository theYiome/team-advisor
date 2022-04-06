import { LolChampionSelectV1 } from "../ClientState/ClientStateTypings";
import * as connections from '../../libs/connections';

/*
    {
        tierCount: 3,
        predictions: [
            { championId: 3, score: 3.2, tier: 2 },
            { championId: 123, score: -4.4, tier: 0 }
        ]
    }
*/
type PredictionApiResponse = {
    tierCount: number;
    predictions: Prediction[];
};

type Prediction = {
    championId: number;
    score: number;
    tier: number;
};

const getPredictions = async (leftTeam: LolChampionSelectV1.Team[], rightTeam: LolChampionSelectV1.Team[], localPlayerCellId: number, localPlayerTeamId: number, favourites: number[], endpoint: string) => {

    const options = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
            leftTeam,
            rightTeam,
            bans: [] as any[],
            localPlayerCellId,
            localPlayerTeamId,
            preferredChampionList: favourites
        },
        json: true
    };

    console.log({ getPredictions: options, endpoint });

    const response: PredictionApiResponse = await connections.fetchJSON(endpoint, options);
    console.log({ response });

    // remove repetitions of response.predictions by championId
    const predictions = response.predictions.reduce((acc, prediction) => {
        const existingPrediction = acc.find(p => p.championId === prediction.championId);
        if (!existingPrediction)
            acc.push(prediction);
        return acc;
    }, [] as Prediction[]);

    response.predictions = predictions;

    // console.log({ response });

    return response;
};

export { getPredictions, PredictionApiResponse, Prediction };