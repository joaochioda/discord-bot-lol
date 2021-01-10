require('dotenv').config();

const {getSummonerInformation, getActiveGameInformartion, getEloInformartion} = require('./service.js');

const { Client } = require('discord.js');
const client = new Client();
const PREFIX = "$";

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in`);
})

client.on('message', async (message) => {
    if (message.author.bot) return;
    if(message.content.startsWith(PREFIX)) {
        const input = message.content.trim().substring(PREFIX.length).split(" ");
        if(input[0] === 'active') {
            input.shift();
            const nickname = input.join(' ');
            const messageToDiscord = await getInfo(nickname);
            message.channel.send(messageToDiscord);
        }
    }
})

client.login(process.env.DISCORDJS_BOT_TOKEN);

function getEmoji(elo) {
    if (elo === 'IRON') {
        return "<:iron2:797949837424721941>"
    }
    if (elo === 'BRONZE') {
        return "<:bronze2:797949725906698251>"
    }
    if (elo === 'SILVER') {
        return "<:silver2:797949873453400116>"
    }
    if (elo === 'GOLD') {
        return "<:gold2:797949813907521586>"
    }
    if (elo === 'PLATINUM') {
        return "<:platinium2:797949864616132648>"
    }
    if (elo === 'DIAMOND') {
        return '<:diamond2:797949803707105280>'
    }
    if (elo === 'MASTER') {
        return "<:master2:797949852486991873>"
    }
    if (elo === 'GRANDMASTER') {
        return "<:grandmaster2:797949826142175292>"
    }
    if (elo === 'CHALLENGER') {
        return "<:challenger2:797949792877674517>"
    }
    else {
        return '';
    }
}

function formatEloName(elo) {
    if (elo === 'IRON') {
        return "F"
    }
    if (elo === 'BRONZE') {
        return "B"
    }
    if (elo === 'SILVER') {
        return "P"
    }
    if (elo === 'GOLD') {
        return "G"
    }
    if (elo === 'PLATINUM') {
        return "P"
    }
    if (elo === 'DIAMOND') {
        return 'D'
    }
    if (elo === 'MASTER') {
        return "M"
    }
    if (elo === 'GRANDMASTER') {
        return "GM"
    }
    if (elo === 'CHALLENGER') {
        return "CH"
    }
}

function formatNumberRank(rank) {
    if (rank === 'I') {
        return '1';
    }
    if (rank === 'II') {
        return '2';
    }
    if (rank === 'III') {
        return '3';
    }
    if (rank === 'IV') {
        return '4';
    }
}


function getAllParticipantsElo(listPlayers) {

    var promises = listPlayers.map(lp => getEloInformartion(lp.id));
    var promisesResolved = Promise.all(promises);

    return promisesResolved.then(promises=> {
        const results = promises.map((result, idx) => {
            const rankedSolo = result.find(elo => elo.queueType === 'RANKED_SOLO_5x5');
            if(rankedSolo) {
                return ({message:`${rankedSolo.summonerName} - ${formatEloName(rankedSolo.tier)}${formatNumberRank(rankedSolo.rank)} ${getEmoji(rankedSolo.tier)}`, team:listPlayers[idx].team})
            }
            return ({message:`${listPlayers[idx].name} :black_circle:`, team:listPlayers[idx].team});
        })
        return results;
    })          
}

function formatMessage(message) {
    const timeA = message.filter(m=> m.team === 100);
    const timeB = message.filter(m=> m.team === 200);

    let timeAtext = '`Time A` \n';
    for (let i=0; i<timeA.length;i++) {
        timeAtext = timeAtext + `${timeA[i].message} \n`
    }

    let timeBtext = '`Time B` \n';
    for (let i=0; i<timeB.length;i++) {
        timeBtext = timeBtext + `${timeB[i].message} \n`
    }
    return timeAtext + timeBtext
}

async function getInfo(name) {
   return getSummonerInformation(name).then(data => {
       if(data && data.id) {
        var promises = Promise.all([getActiveGameInformartion(data.id)]);
        return promises.then(async c=> {
            if (c[0]) {
                const summonersInfo = c[0].participants.map(player => ({id: player.summonerId, name: player.summonerName, team: player.teamId}));
                const result = await getAllParticipantsElo(summonersInfo);
                
                return formatMessage(result);
            } else {
                return 'Usuário não esta jogando.'
            }
        })
    } else {
        return 'Usuário não encontrado.'
    }
    })
}
