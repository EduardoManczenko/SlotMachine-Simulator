
const ap = require("../simulatorUtils/apostador");
const bc = require("../simulatorUtils/banca");

const payApostador = (Apostador, betResult) => {   
    bc.removerSaldo(betResult);
    ap.adicionarSaldo(Apostador, betResult);
    return true
}

//payApostador(3, 100)

const payBanca = (Apostador, valorApostado) => {
    ap.removerSaldo(Apostador, valorApostado);
    bc.adicionarSaldo(valorApostado);
    return true
}

//payBanca(6, 200)

const payThreadBanca = async (Apostador, valorApostado, threadId) => {
    await ap.removerSaldoPorThread(Apostador.usuario, threadId, valorApostado);
    await bc.adicionarSaldoNoThread(valorApostado, threadId);
    return true
}

//payThreadBanca(6, 100, 1)

const payThreadApostador = async (Apostador, valorApostado, threadId) => {
    await bc.removerSaldoNoThread(valorApostado, threadId);
    await ap.adicionarSaldoPorThread(Apostador.usuario, threadId, valorApostado);
    return true
}

//payThreadApostador(6, 100, 1)


const pay = async (Apostador, isTentativaGratis, generate, betValue, threadId) => {
    //if(Apostador.tentativasGratisDiarias > 0 && isTentativaGratis) Apostador.tentativasGratisDiarias -= 1;
    if(isTentativaGratis){ 
        if(generate.betResult <= 0){
            //payBanca(Apostador, Banca, betValue);            
            return {
                vencedor: "Cassino", 
                bounty: 0, 
                saldoDoApostador: Apostador.saldo, 
                saldoDaBanca: bc.balanceOf(),
                betValue: betValue,
                betResult: generate.betResult,
                propabilidade: generate.propabilidade,
                betRandom: generate.betRandom,
                tentativasGratis: {
                    numeroDeTentativasGratisDiarias: Apostador.tentativasGratisDiarias,
                    tentativaGratisResult: isTentativaGratis,
                    tentativaGratis: isTentativaGratis
                }
            };
        } else if(generate.betResult > 0){
            payThreadApostador(Apostador, generate.betResult, threadId);      
            return {
                vencedor: "Apostador", 
                bounty: generate.betResult, 
                saldoDoApostador: Apostador.saldo, 
                saldoDaBanca: bc.balanceOf(),
                betValue: betValue,
                betResult: generate.betResult,
                propabilidade: generate.propabilidade,
                betRandom: generate.betRandom,
                tentativasGratis: {
                    numeroDeTentativasGratisDiarias: Apostador.tentativasGratisDiarias,
                    tentativaGratisResult: isTentativaGratis,
                    tentativaGratis: isTentativaGratis
                }
            }
        }
    }else{
        if(generate.betResult <= 0){
            payThreadBanca(Apostador, betValue, threadId);            
            return {
                vencedor: "Cassino", 
                bounty: 0, 
                saldoDoApostador: Apostador.saldo, 
                saldoDaBanca: bc.balanceOf(),
                betValue: betValue,
                betResult: generate.betResult,
                propabilidade: generate.propabilidade,
                betRandom: generate.betRandom,
                tentativasGratis: {
                    numeroDeTentativasGratisDiarias: Apostador.tentativasGratisDiarias,
                    tentativaGratisResult: isTentativaGratis,
                    tentativaGratis: isTentativaGratis
                }    
            };
        } else if(generate.betResult > 0){
            payThreadApostador(Apostador, generate.betResult, threadId);      
            return {
                vencedor: "Apostador", 
                bounty: generate.betResult, 
                saldoDoApostador: Apostador.saldo, 
                saldoDaBanca: bc.balanceOf(),
                betValue: betValue,
                betResult: generate.betResult,
                propabilidade: generate.propabilidade,
                betRandom: generate.betRandom,
                tentativasGratis: {
                    numeroDeTentativasGratisDiarias: Apostador.tentativasGratisDiarias,
                    tentativaGratisResult: isTentativaGratis,
                    tentativaGratis: isTentativaGratis
                }
            }
        }
    }
}


module.exports = {
    pay: pay
}