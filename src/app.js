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

function getInfo(name) {
   return getSummonerInformation(name).then(data => {
       if(data.id) {
        var promises = Promise.all([getActiveGameInformartion(data.id), getEloInformartion(data.id)]);
        return promises.then(c=> {
            const rankedSolo = c[1].find(elo => elo.queueType === 'RANKED_SOLO_5x5');
            if(rankedSolo) {
                return (`${data.name} ${rankedSolo.tier} ${rankedSolo.rank} ${getEmoji(rankedSolo.tier)} `)
            }
            return 'Unranked';
        })
    } else {
        return 'Usuário não encontrado'
    }
    })
}


//https://discord.com/oauth2/authorize?client_id=795778684271329311&scope=bot
//