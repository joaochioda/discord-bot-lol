const axios = require('axios').default;
const key = '';
const getSummoner = '/lol/summoner/v4/summoners/by-name/';
const getActiveGame = '/lol/spectator/v4/active-games/by-summoner/';
const getElo = '/lol/league/v4/entries/by-summoner/';

const instance = axios.create({
    baseURL: 'https://br1.api.riotgames.com',
    timeout: 50000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
  });


module.exports.getSummonerInformation = async (summoner) => {
    const summonerEncoded = encodeURIComponent(summoner);
    try {
        const response = await instance.get(`${getSummoner}${summonerEncoded}?api_key=${key}`);
        return response.data;
    } catch(ex) {
        console.log(ex);
    }
}

module.exports.getActiveGameInformartion = async (encryptedSummonerId) => {
    try {
        const response = await instance.get(`${getActiveGame}${encryptedSummonerId}?api_key=${key}`);
        return response.data;
    } catch(ex) {
        console.log('Usuário não esta em jogo');
    }
}

module.exports.getEloInformartion = async (encryptedSummonerId) => {
    try {
        const response = await instance.get(`${getElo}${encryptedSummonerId}?api_key=${key}`);
        return response.data;
    } catch(ex) {
        console.log('Usuário não encontrado');
    }
}

