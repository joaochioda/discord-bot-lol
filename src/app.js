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
            const x = await getInfo(nickname);
            message.channel.send(x);
        }
    }
})

client.login(process.env.DISCORDJS_BOT_TOKEN);

function getEmoji(elo) {
    if (elo === 'IRON') {
        return "<:iron:796513861410488347>"
    }
    if (elo === 'SILVER') {
        return "<:silver:796513892683612211>"
    }
    if (elo === 'GOLD') {
        return "<:gold:796513925662507029>"
    }
    if (elo === 'PLATINUM') {
        return "<:platinum:796513950098915378>"
    }
    if (elo === 'DIAMOND') {
        return '<:diamond:796506575744401439>'
    }
    if (elo === 'MASTER') {
        return "<:master:796513982700716095>"
    }
    if (elo === 'GRANDMASTER') {
        return "<:grandmaster:796514034009899108>"
    }
    if (elo === 'CHALLENGER') {
        return "<:challenger:796514004720680960>"
    }
    else {
        return '';
    }
}

function getAllParticipantsElo(listPlayers) {

    var promises = listPlayers.map(lp => getEloInformartion(lp.id));

    var promisesResolved = Promise.all(promises);

    return promisesResolved.then(c=> {
        const results = c.map((result, idx) => {
            const rankedSolo = result.find(elo => elo.queueType === 'RANKED_SOLO_5x5');
            if(rankedSolo) {
                return ({message:`${rankedSolo.summonerName} ${rankedSolo.tier} ${rankedSolo.rank} ${getEmoji(rankedSolo.tier)}`, team:listPlayers[idx].team})
            }
            return ({message:`${listPlayers[idx].name} Unranked`, team:listPlayers[idx].team});
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


//https://discord.com/oauth2/authorize?client_id=795778684271329311&scope=bot
//