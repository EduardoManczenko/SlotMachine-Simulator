const crypto = require('crypto');

const secureRandom = async () => {
    const buffer = crypto.randomBytes(4);

    const randomNumber = buffer.readUInt32BE(0);

    const maxUInt32 = 0xFFFFFFFF;
    const randomDecimal = randomNumber / maxUInt32;

    return parseFloat(randomDecimal.toFixed(5));
};

const randomResult = async () => {
    return [ await secureRandom(), await secureRandom(), await secureRandom(), await secureRandom(), await secureRandom()];
}

const roll = async (propabilidade, betValue) => {
    const random = await randomResult();
    
    if(random[0] < propabilidade && random[1] < propabilidade && random[2] < propabilidade && random[3] < propabilidade && random[4] < propabilidade) {
        const betBounty = betValue * 1000;
        return betBounty;
    }else if(random[0] < propabilidade && random[1] < propabilidade && random[2] < propabilidade && random[3] < propabilidade) {
        const betBounty = betValue * 100;
        return betBounty;
    }else if(random[0] < propabilidade && random[1] < propabilidade && random[2] < propabilidade) {
        const betBounty = betValue * 10;
        return betBounty;
    }else if(random[0] < propabilidade && random[1] < propabilidade) {
        const betBounty = betValue * 5;
        return betBounty;
    }else if(random[0] < propabilidade) {
        const betBounty = betValue * 2;
        return betBounty;
    }else {
        return 0
    }
}

module.exports = {
    roll: roll
}