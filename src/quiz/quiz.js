import { auth }              from "../db/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { gerarPergunta, setOnStatus, resetPoolBD } from "../db/gemini.js";
import { concluirLicao, criarLicao, salvarQuestao, salvarResposta } from "../db/progresso.js";


const params       = new URLSearchParams(window.location.search);
const LICAO_ID     = params.get("licaoId");
const MAT_ID       = params.get("materiaId")    || "portugues";
const MAT_NOME     = params.get("materiaNome")  || "Matéria";
const MAT_NIVEL    = params.get("nivel")        || "6º Ano";
const ESCOLARIDADE = params.get("escolaridade") || "";
const TOPICO       = params.get("topico")       || "Geral";
const EMOJI        = params.get("emoji")        || "📚";
const COR          = params.get("cor")          || "#5f7cff";
const TOTAL        = Math.min(10, Math.max(1, Number(params.get("total")) || 5));


let uid      = null;
let questaoN = 0;
let score    = 0;
let acertos  = 0;
let answered = false;


const screenLoad     = document.getElementById("screenLoading");
const screenQuestion = document.getElementById("screenQuestion");
const screenFeedback = document.getElementById("screenFeedback");
const screenResult   = document.getElementById("screenResult");


onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = "../login/login.html"; return; }
  uid = user.uid;
  initUI();
  gerarProximaPergunta();
});


function initUI() {
  document.documentElement.style.setProperty("--accent", COR);

  setOnStatus(msg => {
    const t = document.getElementById("loadTitle");
    const s = document.getElementById("loadSub");
    if (t) t.textContent = msg || "Gemini está criando sua questão…";
    if (s) s.textContent = msg ? "Por favor, aguarde…" : "Preparando um desafio personalizado";
  });

  document.getElementById("pillEmoji").textContent  = EMOJI;
  document.getElementById("pillNome").textContent   = MAT_NOME;
  document.getElementById("pillTopico").textContent = TOPICO;
  document.title = `EduQuiz – ${MAT_NOME}`;
  atualizarProgresso();
  resetPoolBD(); // limpa pool do BD a cada nova lição
}

// Gera pergunta 
async function gerarProximaPergunta() {
  const lt = document.getElementById("loadTitle");
  const ls = document.getElementById("loadSub");
  if (lt) lt.textContent = "Gemini está criando sua questão…";
  if (ls) ls.textContent = "Preparando um desafio personalizado";
  mostrarTela("loading");

  try {
    const q = await gerarPergunta(MAT_NOME, MAT_NIVEL, TOPICO, MAT_ID);

    // Salva no banco global APENAS questões geradas pela IA (banco já tem as do BD)
    if (q._fonte !== "banco") {
      salvarQuestao({
        materiaId:    MAT_ID,
        materiaNome:  MAT_NOME,
        topico:       TOPICO,
        nivel:        MAT_NIVEL,
        escolaridade: ESCOLARIDADE,
        pergunta:     q.pergunta,
        opcoes:       q.opcoes,
        correta:      q.correta,
        dificuldade:  q.dificuldade,
        explicacao:   q.explicacao,
      }).catch(e => console.warn("Erro ao salvar questão:", e));
    }

    renderPergunta(q);
  } catch (e) {
    console.error("Erro ao gerar pergunta:", e);
    renderErro();
  }
}

//Render pergunta
function renderPergunta(q) {
  answered = false;
  document.getElementById("qNum").textContent  = `Questão ${questaoN + 1} de ${TOTAL}`;
  document.getElementById("qDiff").textContent = q.dificuldade || "Médio";
  document.getElementById("qText").textContent = q.pergunta;

  // Mostra badge discreto quando a questão veio do banco (IA indisponível)
  const srcBadge = document.getElementById("sourceBadge");
  if (srcBadge) {
    srcBadge.textContent  = q._fonte === "banco" ? "📦 Banco de questões" : "";
    srcBadge.style.display = q._fonte === "banco" ? "inline-block" : "none";
  }

  const wrap   = document.getElementById("optionsWrap");
  wrap.innerHTML = "";
  const letras = ["A","B","C","D"];

  q.opcoes.forEach((op, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.innerHTML = `<span class="opt-letter">${letras[i]}</span><span>${op.replace(/^[A-D]\)\s*/i,"")}</span>`;
    btn.addEventListener("click", () => responder(i, q, btn));
    wrap.appendChild(btn);
  });

  mostrarTela("question");
}

//Resposta
function responder(idx, q, clickedBtn) {
  if (answered) return;
  answered = true;

  document.querySelectorAll(".opt-btn").forEach(b => (b.disabled = true));
  const certo = idx === q.correta;
  clickedBtn.classList.add(certo ? "correct" : "wrong");
  document.querySelectorAll(".opt-btn")[q.correta].classList.add("correct");

  if (certo) {
    const pts = { "Fácil": 50, "Médio": 100, "Difícil": 150 }[q.dificuldade] ?? 100;
    score += pts; acertos++;
    document.getElementById("scoreVal").textContent = score;
  }

  // Salva a resposta individual no Firestore (para o histórico)
  if (uid && LICAO_ID) {
    salvarResposta(uid, MAT_ID, LICAO_ID, {
      pergunta:        q.pergunta,
      opcoes:          q.opcoes,
      correta:         q.correta,
      respostaUsuario: idx,
      acertou:         certo,
      dificuldade:     q.dificuldade,
      explicacao:      q.explicacao,
      topico:          TOPICO,
      materiaNome:     MAT_NOME,
      nivel:           MAT_NIVEL,
    }).catch(e => console.warn("Erro ao salvar resposta:", e));
  }

  setTimeout(() => mostrarFeedback(certo, q), 700);
}

//Feedback 
function mostrarFeedback(certo, q) {
  document.getElementById("fbCard").className    = "fb-card " + (certo ? "ok" : "err");
  document.getElementById("fbIcon").textContent  = certo ? "✓" : "✗";
  document.getElementById("fbTitle").textContent = certo ? "Correto! 🎉" : "Quase lá! 💪";
  document.getElementById("fbExplain").textContent = q.explicacao;
  mostrarTela("feedback");
}

document.getElementById("btnNext").addEventListener("click", avancar);

async function avancar() {
  questaoN++;
  atualizarProgresso();
  if (questaoN >= TOTAL) {
    await salvarResultado();
    mostrarResultado();
  } else {
    await gerarProximaPergunta();
  }
}

//Progresso visual
function atualizarProgresso() {
  const pct = (questaoN / TOTAL) * 100;
  document.getElementById("progFill").style.width = pct + "%";
  document.getElementById("progTxt").textContent  = `${questaoN} / ${TOTAL}`;
}

//Salvar no Firestore 
async function salvarResultado() {
  if (!LICAO_ID || !uid) return;
  try { await concluirLicao(uid, MAT_ID, LICAO_ID, acertos, TOTAL); }
  catch (e) { console.error("Erro ao salvar resultado:", e); }
}

//Resultado
function mostrarResultado() {
  const emojis = ["😅","🌱","👍","🌟","🏆"];
  document.getElementById("resEmoji").textContent = emojis[Math.min(acertos, 4)];
  document.getElementById("resSub").textContent   = `Você acertou ${acertos} de ${TOTAL} questões`;
  document.getElementById("resScore").textContent = `+${score} pts`;
  mostrarTela("result");
}

//Botões de resultado 
window.retornoParams = () => new URLSearchParams({
  id: MAT_ID, nome: MAT_NOME, emoji: EMOJI, cor: COR, nivel: MAT_NIVEL,
  escolaridade: ESCOLARIDADE,
}).toString();

window.novaLicaoMesmoTopico = async () => {
  if (!uid) return;
  try {
    const novaId = await criarLicao(uid, MAT_ID, TOPICO, TOTAL);
    const p = new URLSearchParams({
      licaoId: novaId, materiaId: MAT_ID, materiaNome: MAT_NOME,
      nivel: MAT_NIVEL, escolaridade: ESCOLARIDADE,
      topico: TOPICO, emoji: EMOJI, cor: COR, total: TOTAL,
    });
    window.location.href = `../quiz/quiz.html?${p}`;
  } catch (e) { console.error(e); }
};

//Erro
function renderErro() {
  document.getElementById("qText").textContent = "Não foi possível carregar a questão. Verifique sua conexão.";
  document.getElementById("optionsWrap").innerHTML =
    `<button class="btn-next" onclick="gerarProximaPergunta()">Tentar novamente</button>`;
  mostrarTela("question");
}

//Telas 
function mostrarTela(nome) {
  [screenLoad, screenQuestion, screenFeedback, screenResult]
    .forEach(s => s.classList.add("hidden"));
  ({ loading: screenLoad, question: screenQuestion,
     feedback: screenFeedback, result: screenResult })[nome]
    ?.classList.remove("hidden");
}