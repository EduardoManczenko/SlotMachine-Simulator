const { Worker } = require('worker_threads');
const ap = require('./modulos/simulatorUtils/apostador.js');
const bc = require('./modulos/simulatorUtils/banca.js');

const main = async () => {
    const workers = [];
    const numThreads = 4;
    const data = {
        numApostadores: 100, 
        minSaldo: 10, 
        maxSaldo: 500, 
        porcetagemAposta: 0.1, 
        quantidadeTentativasGratisDiarias: 15,
        saldoBanca: 39696
    }
    
    let novaBanca = await bc.gerar(data.saldoBanca, numThreads);
    for(let i = 0; i < 30; i++){
        console.log("dia: ", i + 1)
        await dia(workers, numThreads, data);
        
    }
    console.log("Fim do simulador")
};


//remover os workers da main e colocar dentro do dia para ver se para de acomular workers enquanto roda um mes
const dia = async (workers, numThreads, data) => {
    
    let novosApostadores = await ap.gerar(data.numApostadores, data.minSaldo, data.maxSaldo, data.porcetagemAposta, data.quantidadeTentativasGratisDiarias, numThreads);
    let promises = [];
    try {
        for (let i = 0; i < numThreads; i++) {
            const worker = new Worker('./simulatorWorkerDia.js');
            workers.push(worker);

            const promise = new Promise((resolve, reject) => {
                worker.on('message', (result) => {
                    console.log('Worker finished with result:', result);
                    resolve(result); 
                });

                worker.on('error', (error) => {
                    console.error('Worker error:', error);
                    reject(error); 
                });

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        console.error(`Worker stopped with exit code ${code}`);
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            });

           
            promises.push(promise);

            
            worker.postMessage({
                novosApostadores, i, numThreads
            });
        }
        
        await Promise.all(promises);
        console.log("Todos os workers terminaram");
    } catch (e) {
        console.error(e);
    } finally {
        //fazer uma função no finally para tratar os logs em um ambiente separado do sistema
        let totalBalances = 0
        for(let i = 0; i < numThreads; i++){
            let banca = await bc.carregarBancaDoThread(i);
            totalBalances += banca.saldo
        }
        bc.alterarSaldo(totalBalances);
        console.log("Processamento completo");

        //encerrando os workers, obs: definitivamente isso esta no lugar errado ou funcionando errado
        
        // workers.forEach(worker => {
        //     worker.terminate().then(() => {
        //         console.log("Worker terminado com sucesso");
        //     }).catch(error => {
        //         console.error("Erro ao terminar worker:", error);
        //     });
        // });
    }
}

main();
