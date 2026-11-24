import { saveResult } from "./ranking/saveResult.js";
import { loadRanking } from "./ranking/loadRanking.js";
import { findCountry } from "./game/findCountry.js";
import { gameState } from "./game/gameState.js";
import { createTimer } from "./game/timer.js";

// ELEMENTOS DO HTML
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const inputElement = document.getElementById("countryInput");
const feedbackElement = document.getElementById("feedback");
const countriesList = document.getElementById("foundCountries");
const restartButton = document.getElementById("restartButton");
const giveUpButton = document.getElementById("giveUpButton");

// CONFIGURAÇÕES DO JOGO
const TOTAL_COUNTRIES = 50;
const GAME_DURATION = 180;
const VALIDATION_DELAY = 800;

// ESTADO DA PARTIDA
let gameStarted = false;
let gameFinished = false;
let validationTimeout = null;

// FORMATAÇÃO DO CRONÔMETRO
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// CRIAÇÃO DO CRONÔMETRO
const gameTimer = createTimer({
  duration: GAME_DURATION,

  onTick(seconds) {
    timerElement.textContent = formatTime(seconds);
  },

  onFinish() {
    finishGame("⏰ Tempo esgotado! Você pode tentar novamente!");
  },
});

// INICIAR PARTIDA
function startGame() {
  if (gameStarted || gameFinished) return;

  gameStarted = true;
  gameTimer.start();

  giveUpButton.hidden = false;

  feedbackElement.textContent = "🚀 Partida iniciada! Boa sorte!";
}

// FINALIZAR PARTIDA

function finishGame(message, won = false) {
    if (gameFinished) return;

    gameFinished = true;

    clearTimeout(validationTimeout);
    gameTimer.pause();

    inputElement.disabled = true;

    giveUpButton.hidden = true;
    restartButton.hidden = false;

    feedbackElement.textContent = message;

    if (won) {
        feedbackElement.classList.add("victory");
    }

    // REGISTRAR RESULTADO DA PARTIDA
    registerFinishedGame();
}


async function registerFinishedGame() {
    const playerName = window.prompt(
        "Digite seu apelido para entrar no ranking (máximo 20 caracteres):"
    );

    if (playerName === null) {
        return;
    }

    const cleanName = playerName.trim().slice(0, 20);

    if (!cleanName) {
        alert("O apelido não pode ficar vazio.");
        return;
    }

    const elapsedSeconds =
        GAME_DURATION - gameTimer.getRemainingTime();

    const countriesFound = gameState.getScore();

    const saved = await saveResult(
        cleanName,
        countriesFound,
        elapsedSeconds
    );

    if (saved) {
        await loadRanking();
        console.log("Ranking atualizado!");
    } else {
        alert("Não foi possível salvar seu resultado. Tente novamente mais tarde.");
    }
}


// VALIDAR RESPOSTA
function validateAnswer() {
  if (gameFinished) return;

  const answer = inputElement.value.trim();

  if (!answer) return;

  const country = findCountry(answer);

  if (!country) {
    feedbackElement.textContent = "❌ País não encontrado! Tente novamente.";
    return;
  }

  // VERIFICAR SE O PAÍS JÁ FOI ENCONTRADO
  const wasAdded = gameState.addCountry(country.code);

  if (!wasAdded) {
    feedbackElement.textContent = "⚠️ Você já encontrou esse país!";
    inputElement.value = "";
    return;
  }

  // INICIAR CRONÔMETRO NA PRIMEIRA RESPOSTA VÁLIDA
  if (!gameStarted) {
    startGame();
  }

  // ATUALIZAR PONTUAÇÃO
  const score = gameState.getScore();

  scoreElement.textContent = `${score} / ${TOTAL_COUNTRIES}`;

  // ADICIONAR PAÍS À LISTA
  const listItem = document.createElement("li");
  listItem.textContent = country.name;

  countriesList.appendChild(listItem);

  // LIMPAR CAMPO DE RESPOSTA
  inputElement.value = "";

  // VERIFICAR VITÓRIA
  if (score >= TOTAL_COUNTRIES) {
    finishGame(
      "🏆 PARABÉNS! VOCÊ VENCEU! Encontrou os 50 países antes do tempo acabar!",
      true,
    );

    return;
  }

  feedbackElement.textContent = `✅ ${country.name} encontrado!`;
}

// DETECTAR DIGITAÇÃO
inputElement.addEventListener("input", () => {
  if (gameFinished) return;

  clearTimeout(validationTimeout);

  const answer = inputElement.value.trim();

  if (!answer) {
    feedbackElement.textContent = gameStarted
      ? "Continue digitando..."
      : "Digite seu primeiro país para começar!";

    return;
  }

  validationTimeout = setTimeout(() => {
    validateAnswer();
  }, VALIDATION_DELAY);
});

// DESISTIR DA PARTIDA
function giveUpGame() {
  if (!gameStarted || gameFinished) return;

  finishGame("🏳️ Você desistiu da partida! Que tal tentar novamente?");
}

// REINICIAR PARTIDA
function restartGame() {
  clearTimeout(validationTimeout);

  // LIMPAR PAÍSES ENCONTRADOS
  gameState.reset();

  // RESTAURAR ESTADO
  gameStarted = false;
  gameFinished = false;

  // REINICIAR CRONÔMETRO
  gameTimer.reset();

  // RESTAURAR PONTUAÇÃO
  scoreElement.textContent = `0 / ${TOTAL_COUNTRIES}`;

  // LIMPAR LISTA DE PAÍSES
  countriesList.innerHTML = "";

  // RESTAURAR CAMPO DE RESPOSTA
  inputElement.value = "";
  inputElement.disabled = false;

  // CONTROLAR BOTÕES
  restartButton.hidden = true;
  giveUpButton.hidden = false;

  // REMOVER ESTILO DE VITÓRIA
  feedbackElement.classList.remove("victory");

  // MENSAGEM INICIAL
  feedbackElement.textContent = "Digite seu primeiro país para começar!";

  inputElement.focus();
}

// EVENTOS DOS BOTÕES
restartButton.addEventListener("click", restartGame);
giveUpButton.addEventListener("click", giveUpGame);

// CONFIGURAÇÃO INICIAL
gameState.reset();

scoreElement.textContent = `0 / ${TOTAL_COUNTRIES}`;
timerElement.textContent = formatTime(GAME_DURATION);

feedbackElement.textContent = "Digite seu primeiro país para começar!";

inputElement.disabled = false;
inputElement.value = "";

restartButton.hidden = true;
giveUpButton.hidden = false;

inputElement.focus();

console.log("Jogo carregado com sucesso!");

// CARREGAR RANKING AO ABRIR O JOGO
loadRanking();
