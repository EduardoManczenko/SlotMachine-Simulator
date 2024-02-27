const { parentPort } = require('worker_threads');
const ap = require('./modulos/simulatorUtils/apostador.js');
const bet = require('./modulos/cassinoRules/bet.js');
const bc = require('./modulos/simulatorUtils/banca.js');
const pay = require('./modulos/cassinoRules/pay.js');


//fazer logica para pegar apostas aleatoriamentes caso o jogador ainda não tenha jogado para funcionar o multi threading
const dia = async (workerData) => {
    let logs = [];
    
    let numThreads = workerData.numThreads;
    let threadStart = workerData.i;

    //let novosApostadores = workerData.novosApostadores;
    let novosApostadores = await ap.carregarApostadoresParaThread(threadStart, numThreads);
    //console.log(apostadores)
    for (let i = 0; i < novosApostadores.length; i++) {
        let saldoInicial = novosApostadores[i].saldo;
        let totalApostado = 0;
        
        

        while (totalApostado !== saldoInicial) {
             // Supondo que isso recarrega os dados dos apostadores
            //console.log(`thread: ${threadStart}, apostador: ${apostadores[i].usuario}`, "Saldo inicial: ", saldoInicial)
            let apostadores = await ap.carregarApostadoresParaThread(threadStart, numThreads);
            let valorApostado = apostadores[i].valorApostado;
            
            //console.log("valor apostado? ", valorApostado, "\n", "usuario: ", apostadores[i].usuario,"\n", "Saldo inicial: ", saldoInicial, "\n", "tentativasGratis: ", apostadores[i].tentativasGratisDiarias, "\n")
            
            if (apostadores[i].tentativasGratisDiarias > 0) {
                //console.log("entrou no if")
                let log = await bet.bet(apostadores[i], valorApostado, true, threadStart);
                //console.log(log)
                await ap.removerTentativasGratisDiarias(apostadores[i].usuario, threadStart);
                logs.push(log);
            } else {
                //console.log("entrou no else")
                let log = await bet.bet(apostadores[i], valorApostado, false, threadStart);
                totalApostado += valorApostado;
                logs.push(log);
            }
        }
    }

    //colocar para retornar os logs do dia aqui, e fazer uma função no finally do dia das threads para tratar os logs
    parentPort.postMessage({ status: 'done'});
};

parentPort.on('message', (data) => {
    dia(data);
});
