import { db } from "./fireBaseConfig.js";

import {
    ref,
    push,
    set,
    get,
    query,
    orderByChild,
    limitToLast
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const tamanho = 9;
const totalBombas = 20;

let campo = [];
let jogoAtivo = true;
let pontos = 0;

let jogadorNome = localStorage.getItem("jogadorNome");

const tabuleiro = document.getElementById("tabuleiro");
const statusTexto = document.getElementById("status");
const pontosTexto = document.getElementById("pontos");

if (!jogadorNome) {
    alert("Digite seu nome primeiro!");
    window.location.href = "index.html";
}

statusTexto.innerText = "Jogador: " + jogadorNome;

function iniciarJogo() {
    campo = [];
    jogoAtivo = true;
    pontos = 0;

    pontosTexto.innerText = "Pontos: 0";
    tabuleiro.innerHTML = "";

    for (let i = 0; i < tamanho * tamanho; i++) {
        campo.push({
            bomba: false,
            aberta: false,
            elemento: null
        });
    }

    colocarBombas();
    desenhar();
    carregarRanking();
}

function colocarBombas() {
    let bombas = 0;

    while (bombas < totalBombas) {
        let pos = Math.floor(Math.random() * campo.length);

        if (!campo[pos].bomba) {
            campo[pos].bomba = true;
            bombas++;
        }
    }
}

function desenhar() {
    tabuleiro.innerHTML = "";

    campo.forEach((celula, i) => {
        const div = document.createElement("div");

        div.classList.add("celula");

        div.onclick = () => {
            if (jogoAtivo) {
                abrirCelula(i);
            }
        };

        celula.elemento = div;
        tabuleiro.appendChild(div);
    });
}

function contarBombas(index) {
    let total = 0;

    let linha = Math.floor(index / tamanho);
    let coluna = index % tamanho;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            let l = linha + i;
            let c = coluna + j;

            if (l >= 0 && l < tamanho && c >= 0 && c < tamanho) {
                if (campo[l * tamanho + c].bomba) {
                    total++;
                }
            }
        }
    }

    return total;
}

function abrirCelula(index) {
    let celula = campo[index];

    if (celula.aberta) return;

    if (celula.bomba) {
        revelarBombas();
        fimDeJogo(false);
        return;
    }

    let bombas = contarBombas(index);

    celula.aberta = true;
    celula.elemento.classList.add("aberta");

    pontos += 10;
    pontosTexto.innerText = "Pontos: " + pontos;

    if (bombas > 0) {
        celula.elemento.innerText = bombas;
    }

    verificarVitoria();
}

function revelarBombas() {
    campo.forEach(celula => {
        if (celula.bomba) {
            celula.elemento.innerText = "💣";
            celula.elemento.classList.add("bomba");
        }
    });
}

function verificarVitoria() {
    let abertas = campo.filter(celula => celula.aberta).length;

    if (abertas === tamanho * tamanho - totalBombas) {
        pontos += 100;
        pontosTexto.innerText = "Pontos: " + pontos;
        fimDeJogo(true);
    }
}

function fimDeJogo(vitoria) {
    jogoAtivo = false;

    document.getElementById("telaFinal").style.display = "flex";

    document.getElementById("mensagemFinal").innerText =
        vitoria ? "🏆 Você venceu!" : "💥 Você perdeu!";

    document.getElementById("pontuacaoFinal").innerText =
        "Pontuação: " + pontos;
}

async function salvarPontuacao() {
    try {
        const rankingRef = ref(db, "ranking");
        const novoRanking = push(rankingRef);

        await set(novoRanking, {
            nome: jogadorNome,
            pontos: pontos,
            data: new Date().toISOString()
        });

        alert("Pontuação salva com sucesso!");
        carregarRanking();

    } catch (erro) {
        console.error("Erro ao salvar pontuação:", erro);
        alert("Erro ao salvar pontuação!");
    }
}

async function carregarRanking() {
    const rankingDiv = document.getElementById("ranking");

    if (!rankingDiv) return;

    rankingDiv.innerHTML = "<h2>Ranking</h2>";

    try {
        const rankingQuery = query(
            ref(db, "ranking"),
            orderByChild("pontos"),
            limitToLast(10)
        );

        const snapshot = await get(rankingQuery);

        if (snapshot.exists()) {
            let dados = [];

            snapshot.forEach(item => {
                dados.push(item.val());
            });

            dados.sort((a, b) => b.pontos - a.pontos);

            dados.forEach((jogador, index) => {
                const p = document.createElement("p");

                p.innerText =
                    `${index + 1}º - ${jogador.nome}: ${jogador.pontos} pontos`;

                rankingDiv.appendChild(p);
            });
        } else {
            rankingDiv.innerHTML += "<p>Nenhuma pontuação salva ainda.</p>";
        }

    } catch (erro) {
        console.error("Erro ao carregar ranking:", erro);
    }
}

function voltarInicio() {
    localStorage.removeItem("jogadorNome");
    window.location.href = "index.html";
}

window.salvarPontuacao = salvarPontuacao;
window.voltarInicio = voltarInicio;

iniciarJogo();