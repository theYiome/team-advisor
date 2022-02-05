# Team Advisor
Assistance for your League of Legends games.

### Core features
- Auto accept in game queues
- Auto hover bans of your choice
- Suggest good picks based on enemy and allay champions
- Auto hover best suggested pick
- Auto lock in when pick timer runs out

### Other features
- automatically adds new chamions on new League patch
- option to launch on system startup
- works in system tray
- auto update form GitHub Releases (thanks to `update-electron-app`)

## Looks
### Settings of League Client
![Settings of League Client](/docs/ta_league_client.png)
### Smart Accept
![Smart Accept](/docs/ta_smart_accept.png)
### Smart Champion Select
![Ban list](/docs/ta_championselect_chamionlist.png)
### Pick Suggestions
![Pick Suggestions](/docs/ta_picksuggestions.png)

## Installing
You can download installer for current release from GitHub:<br/>
[https://github.com/theYiome/team-advisor/releases](https://github.com/theYiome/team-advisor/releases)

File name of an installer looks like this: `team-advisor-<version>.Setup.exe`

## Running
Requires `npm` to run
```bash
git clone https://github.com/theYiome/team-advisor.git
cd team-advisor
npm i
npm start
```

## Builiding
Requires `npm` to build
```bash
git clone https://github.com/theYiome/team-advisor.git
cd team-advisor
npm i
npm run make
```
Binaries will be in `out/make`.

## Resources
### Data dragon
https://developer.riotgames.com/docs/lol

http://ddragon.leagueoflegends.com/cdn/11.24.1/data/en_US/champion.json

http://ddragon.leagueoflegends.com/cdn/11.24.1/img/champion/Aatrox.png

### LCU
https://lcu.vivide.re/