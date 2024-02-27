const dice = require('./dice.js');
const pay = require('./pay.js');
const ap = require('../simulatorUtils/apostador.js');

const generateBet = async (valorApostado, isTentativaGratis) => {
    const propabilidade = isTentativaGratis ? 0.014 : 0.14;
    const betResult = await dice.roll(propabilidade, valorApostado)
    return {betResult, propabilidade}
}

const bet =  async (Apostador, valorApostado, isTentativaGratis, threadId) => {
    const saldo = await ap.balanceOfThread(Apostador.usuario, threadId);
    if(saldo <= 0) return null;
    if(saldo < valorApostado) return null;
    const betValue = isTentativaGratis ? 1 : valorApostado;
    const generate = await generateBet(betValue, isTentativaGratis);
    const thePay = await pay.pay(Apostador, isTentativaGratis, generate, betValue, threadId);
    const log = { thePay, generate }
    return log;
}

//bet(1, 50, false)

module.exports = {
    bet: bet
}