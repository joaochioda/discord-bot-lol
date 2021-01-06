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

function getInfo(name) {
   return getSummonerInformation(name).then(id => {
       if(id) {
        var promises = Promise.all([getActiveGameInformartion(id), getEloInformartion(id)]);
        return promises.then(c=> {
            // console.log(c[0]);
            console.log(c[1][0].tier);
            return c[1][0].tier;
        })
    } else {
        return 'Usuário não encontrado'
    }
    })
}


//https://discord.com/oauth2/authorize?client_id=795778684271329311&scope=bot
//