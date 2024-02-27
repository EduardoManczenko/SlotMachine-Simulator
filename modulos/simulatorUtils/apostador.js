const fs = require('fs');
const { threadId } = require('worker_threads');
const path = 'apostadores.json'

class Apostador {
    constructor(usuario, valorApostado, saldo, tentativasGratisDiarias) {
        this.usuario = usuario;
        this.valorApostado = valorApostado;
        this.saldo = saldo;
        this.tentativasGratisDiarias = tentativasGratisDiarias;
    }
}


const carregarApostadores = () => {
    try {
        const dataBuffer = fs.readFileSync(path);
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (e) {
        return [];
    }
};

const carregarApostadoresParaThread = async (threadId) => {
    try {
        const dataBuffer = fs.readFileSync(`Threads/Thread${threadId}.json`);
        const dataJSON = dataBuffer.toString();
        const apostadores = JSON.parse(dataJSON);
        return apostadores;
    } catch (e) {
        return [];
    }
}

const separarApostadoresParaThread = (inicio, passo) => {
    try {
        const dataBuffer = fs.readFileSync(path);
        const dataJSON = dataBuffer.toString();
        const apostadores = JSON.parse(dataJSON);
        // Filtra os apostadores com base no início e no passo
        const apostadoresFiltrados = apostadores.filter((_, index) => (index - inicio) % passo === 0);
        return apostadoresFiltrados;
    } catch (e) {
        return [];
    }
};

const salvarApostadores = (apostadores) => {
    const dataJSON = JSON.stringify(apostadores, null, 4);
    fs.writeFileSync(path, dataJSON);
};

const salvarApostadoresPorThread = async (apostadores, threadId) => {
    const caminhoDoArquivo = `Threads/Thread${threadId}.json`;
    try {
        const dataJSON = JSON.stringify(apostadores, null, 4);
        fs.writeFileSync(caminhoDoArquivo, dataJSON);
        //console.log(`${caminhoDoArquivo}`);
    } catch (e) {
        console.error('Erro ao salvar apostadores:', e);
    }

    
};

const balanceOf = (usuarioId) => {
    const apostadores = carregarApostadores();
    const apostador = apostadores.find(apostador => apostador.usuario === usuarioId);

    if (apostador) {
        return apostador.saldo;
    } else {
        return null;
    }
};

const balanceOfThread = async (usuarioId, threadId) => {
    const apostadores = await carregarApostadoresParaThread(threadId);
    const apostador = apostadores.find(apostador => apostador.usuario === usuarioId);
    if (apostador) {
        return apostador.saldo;
    } else {
        return null;
    }
}


const adicionarSaldo = (usuarioId, valor) => {
    let apostadores = carregarApostadores();
    const usuarioIndex = apostadores.findIndex(apostador => apostador.usuario === usuarioId);  
    apostadores[usuarioIndex].saldo += valor;
    salvarApostadores(apostadores);
};

const adicionarSaldoPorThread = async (usuarioId, threadId, valor) => {
    let apostadores = await carregarApostadoresParaThread(threadId);
    const usuarioIndex = apostadores.findIndex(apostador => apostador.usuario === usuarioId);
    apostadores[usuarioIndex].saldo += valor;
    await salvarApostadoresPorThread(apostadores, threadId);
}

//adicionarSaldoPorThread(2, 1, 100)

const removerSaldo = (usuarioId, valor) => {
    let apostadores = carregarApostadores();

    const usuarioIndex = apostadores.findIndex(apostador => apostador.usuario === usuarioId);
    apostadores[usuarioIndex].saldo -= valor;
    salvarApostadores(apostadores);  
};

const removerSaldoPorThread = async (usuarioId, threadId, valor) => {
    let apostadores = await carregarApostadoresParaThread(threadId);
    const usuarioIndex = apostadores.findIndex(apostador => apostador.usuario === usuarioId);
    apostadores[usuarioIndex].saldo -= valor;
    await salvarApostadoresPorThread(apostadores, threadId);
}

//removerSaldoPorThread(2, 1, 1020)

const removerTentativasGratisDiarias = async (usuarioId, threadId) => {
    let apostadores = await carregarApostadoresParaThread(threadId);
    const usuarioIndex = apostadores.findIndex(apostador => apostador.usuario === usuarioId);
    if(apostadores[usuarioIndex].tentativasGratisDiarias <= 0) return null
    apostadores[usuarioIndex].tentativasGratisDiarias -= 1;
    await salvarApostadoresPorThread(apostadores, threadId);  
};

//removerTentativasGratisDiarias(2, 1, 4)

const gerarSaldosAleatorios =  (min, max, numApostadores) => {
    let saldos = [];

    if (min % 5 !== 0) {
        min += 5 - min % 5;
    }
    for (let i = 0; i < numApostadores; i++) {
        let saldoAleatorio = Math.floor(Math.random() * ((max - min) / 5 + 1)) * 5 + min;
        saldos.push(saldoAleatorio);
    }
    return saldos;
}

const gerarApostadores = (numApostadores, minSaldo, maxSaldo, porcentagemApostada, quantidadeTentativasGratisDiarias) => {
    let apostadores = []

    const saldosAleatorios = gerarSaldosAleatorios(minSaldo, maxSaldo, numApostadores);

    for(let i = 0; i < numApostadores; i++){
        const quantidadeApostada = porcentagemApostada * saldosAleatorios[i];
        const saldo = saldosAleatorios[i];
        //controla pra no minimo 50 reais para ganhar as tentativas gratis
        const tentativasGratisDiarias = saldo < 50 ? 0 : quantidadeTentativasGratisDiarias;
        apostadores.push(new Apostador(i + 1, quantidadeApostada, saldo, tentativasGratisDiarias));
    }

    return apostadores
}

const criarArquivoThread = (apostadores, threadId) => {
    const data = JSON.stringify(apostadores, null, 2);
    fs.writeFileSync(`Threads/Thread${threadId}.json`, data);
}

const criarArquivo = (apostadores) => {
    const data = JSON.stringify(apostadores, null, 2);
    fs.writeFileSync('apostadores.json', data);
}

const gerar = async (numApostadores, minSaldo, maxSaldo, porcentagemApostada, quantidadeTentativasGratisDiarias, numThreads) => {
    const apostadores = gerarApostadores(numApostadores, minSaldo, maxSaldo, porcentagemApostada, quantidadeTentativasGratisDiarias)
    criarArquivo(apostadores);
   
    for(let i = 0; i < numThreads; i++){
        const threadApostadores = separarApostadoresParaThread(i, numThreads)
        criarArquivoThread(apostadores, i)
        salvarApostadoresPorThread(threadApostadores, i)
    }
    return apostadores;
}

//gerar(20, 10, 500, 0.1, 15, 4)

//console.log(carregarApostadoresParaThread(1,4))



module.exports = {
    gerar: gerar,
    adicionarSaldo: adicionarSaldo,
    removerSaldo: removerSaldo,
    balanceOf: balanceOf,
    balanceOfThread: balanceOfThread,
    removerTentativasGratisDiarias: removerTentativasGratisDiarias,
    carregarApostadores: carregarApostadores,
    separarApostadoresParaThread: separarApostadoresParaThread,
    removerSaldoPorThread: removerSaldoPorThread,
    adicionarSaldoPorThread: adicionarSaldoPorThread,
    carregarApostadoresParaThread: carregarApostadoresParaThread,
    salvarApostadoresPorThread: salvarApostadoresPorThread
}