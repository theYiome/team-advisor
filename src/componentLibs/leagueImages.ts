// TODO: it does not work, issue with webpack?
// https://webpack.js.org/guides/asset-management/#loading-images

// import TopIcon from '../images/top.png';
// import JungleIcon from '../images/jungle.png'
// import BottomIcon from '../images/bottom.png';
// import SupportIcon from '../images/support.png';
// import MiddleIcon from '../images/middle.png';

const roleImages: any = {
    top: "https://static.wikia.nocookie.net/leagueoflegends/images/e/ef/Top_icon.png",
    jungle: "https://static.wikia.nocookie.net/leagueoflegends/images/1/1b/Jungle_icon.png",
    middle: "https://static.wikia.nocookie.net/leagueoflegends/images/9/98/Middle_icon.png",
    bottom: "https://static.wikia.nocookie.net/leagueoflegends/images/9/97/Bottom_icon.png",
    support: "https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png"
}

function avatarURI(patch: string, championName: string) {
    if (patch && championName && championName !== "" && championName !== "null")
        return `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championName}.png`;
    else
        return `https://icon-library.com/images/missing-image-icon/missing-image-icon-19.jpg`;
}

export {roleImages, avatarURI};