const fs = require('fs')
const path = 'banca.json'

class Banca {
    constructor(saldo) {
        this.saldo = saldo;
    }
}

const carregarBanca = () => {
    try {
        const dataBuffer = fs.readFileSync(path);
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (e) {
        return [];
    }
};

const carregarBancaDoThread = async (threadId) => {
    try {
        const dataBuffer = fs.readFileSync(`Threads/ThreadBanca${threadId}.json`);
        const dataJSON = dataBuffer.toString();
        const banca = JSON.parse(dataJSON);
        return banca;
    } catch (e) {
        return [];
    }
}


const salvarBanca = (banca) => {
    const dataJSON = JSON.stringify(banca, null, 4);
    fs.writeFileSync(path, dataJSON);
};

const salvarBancaNoThread = async (banca, threadId) => {
    const dataJSON = JSON.stringify(banca, null, 4);
    fs.writeFileSync(`Threads/ThreadBanca${threadId}.json`, dataJSON);
}

const balanceOf = () => {
    const banca = carregarBanca();
    return banca.saldo;
}

const balanceOfThread = async (threadId) => {
    const banca = await carregarBancaDoThread(threadId);
    return banca
}

const adicionarSaldo = async (valor) => {
    const banca = carregarBanca();
    banca.saldo += valor;
    salvarBanca(banca);
}

//adicionarSaldo(500)

const removerSaldo = async (valor) => {
    const banca = carregarBanca();
    banca.saldo -= valor;
    salvarBanca(banca);
}

const alterarSaldo = async (valor) => {
    const banca = carregarBanca();
    banca.saldo = valor;
    salvarBanca(banca);
}

//removerSaldo(500)

const adicionarSaldoNoThread = async (valor, threadId) => {
    const banca = await carregarBancaDoThread(threadId)
    //console.log(banca)
    banca.saldo += valor;
    await salvarBancaNoThread(banca, threadId)
}

const removerSaldoNoThread = async (valor, threadId) => {
    const banca = await carregarBancaDoThread(threadId)
    //console.log(banca)
    banca.saldo -= valor;
    await salvarBancaNoThread(banca, threadId)
}


const criarArquivo = (banca) => {
    const data = JSON.stringify(banca, null, 2);
    fs.writeFileSync('banca.json', data);
}

const criarArquivoParaThread = (saldo, threadId) => {
    const banca = new Banca(saldo);
    const data = JSON.stringify(banca, null, 2);
    fs.writeFileSync(`Threads/ThreadBanca${threadId}.json`, data)
}

const gerar = async (saldo, numThreads) => {
    const banca = new Banca(saldo);
    criarArquivo(banca);
    for(let i = 0; i < numThreads; i++){
        criarArquivoParaThread(saldo / numThreads, i)
    }
    return banca
}


//gerar(10000, 4)

module.exports = {
    balanceOf: balanceOf,
    adicionarSaldo: adicionarSaldo,
    removerSaldo: removerSaldo,
    gerar: gerar,
    balanceOfThread: balanceOfThread,
    carregarBanca: carregarBanca,
    adicionarSaldoNoThread: adicionarSaldoNoThread,
    removerSaldoNoThread: removerSaldoNoThread,
    carregarBancaDoThread: carregarBancaDoThread,
    alterarSaldo: alterarSaldo
}