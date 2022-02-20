import { ChampionsProvider } from "./ChampionProvider";
import { LcuProvider } from "./LcuProvider";
import { SettingsProvider } from "./Settings/SettingsProvider";

export const Main: React.FC = () => {

    return (
        <SettingsProvider>
            <LcuProvider>
                <ChampionsProvider>

                </ChampionsProvider>
            </LcuProvider>
        </SettingsProvider>
    );
}
