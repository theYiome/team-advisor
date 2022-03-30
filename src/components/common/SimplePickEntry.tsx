import { Stack, Avatar, Tooltip } from "@mui/material";
import { avatarURI, roleImages } from "../../componentLibs/leagueImages";
import { LolChampionSelectV1 } from "../ClientState/ClientStateTypes";

interface SimpleEntryPickerProps {
    champion: string,
    role: LolChampionSelectV1.Position,
    patch: string,
    variant: "player" | "allay" | "enemy"
};

// display champion avatar and role
const SimplePickEntry = ({ champion, role, patch, variant }: SimpleEntryPickerProps) => {
    const size = { width: 54, height: 54 };
    const variantStyle = () => {
        switch (variant) {
            case "player":
                return { boxShadow: "0 6px 12px rgba(255, 215, 0, 0.25), 0 6px 12px rgba(255, 215, 0, 0.30)" };
            case "allay":
                return { boxShadow: "0 10px 20px rgba(8, 60, 158, 0.25), 0 8px 12px rgba(8, 60, 158, 0.30)" };
            case "enemy":
                return { boxShadow: "0 10px 20px rgba(255, 0, 0, 0.25), 0 8px 12px rgba(255, 0, 0, 0.30)" };
        }
    }
    const style = { ...size, ...variantStyle() };
    return (
        <Stack spacing={2}>
            <Tooltip title={champion}>
                <Avatar sx={style} alt={champion} src={avatarURI(patch, champion)} variant='square'/>
            </Tooltip>
            <Tooltip title={role}>
                <Avatar sx={style} alt={role} src={roleImages[role]} variant="square"/>
            </Tooltip>
        </Stack>
    );
}

export { SimplePickEntry };