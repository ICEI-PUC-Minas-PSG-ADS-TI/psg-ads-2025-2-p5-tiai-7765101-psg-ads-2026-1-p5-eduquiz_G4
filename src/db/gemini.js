//  Fluxo de gerarPergunta():
//    1. Tenta Gemini (todos os modelos, com retry em 429)
//    2. Se falhar → busca no Firestore (matéria+tópico → geral → matéria → nível)
//    3. Se BD vazio → lança erro para o chamador tratar

import { buscarQuestoes } from "./progresso.js";

const GEMINI_API_KEY = "AIzaSyALU6KzJgpXkrBdg8eDPvqhJYvOBGPt-BQ";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

const TIMEOUT_MS = 15000;

function modelUrl(m) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_API_KEY}`;
}


//Callback de status para a UI
let _onStatus = null;
export function setOnStatus(fn) { _onStatus = fn; }
function notify(msg) { if (typeof _onStatus === "function") _onStatus(msg); }

//  Fetch com timeout 
async function fetchGemini(model, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(modelUrl(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data, timedOut: false };
  } catch (e) {
    return { ok: false, status: 0, data: {}, timedOut: e.name === "AbortError" };
  } finally {
    clearTimeout(timer);
  }
}

// ── Core Gemini ───────────────────────────────────────────────
// Tenta cada modelo UMA vez. Em 429/404/timeout → próximo modelo imediatamente.
// Sem retry com sleep — o fallback para o BD deve ser instantâneo.
export async function geminiText(prompt, opts = {}) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.9,
      maxOutputTokens: opts.maxOutputTokens ?? 800,
    },
  };

  for (const model of GEMINI_MODELS) {
    const { ok, status, data, timedOut } = await fetchGemini(model, body);

    if (timedOut) {
      notify("Gemini: timeout, tentando próximo modelo…");
      continue;
    }

    if (ok) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) { notify(""); return text; }
      continue; // resposta vazia → próximo modelo
    }

    if (status === 429) {
      // Quota esgotada neste modelo → tenta o próximo sem esperar
      console.warn(`[Gemini] ${model} → 429 (quota). Próximo modelo…`);
      notify("Gemini indisponível, buscando no banco…");
      continue;
    }

    if (status === 404) {
      // Modelo não existe → próximo
      continue;
    }

    // Outro erro HTTP → próximo modelo
    console.warn(`[Gemini] ${model} → erro ${status}`);
  }

  throw new Error("Gemini indisponível");
}

export async function geminiJSON(prompt, opts = {}) {
  const raw = await geminiText(prompt, opts);
  const clean = raw.replace(/```json|```/gi, "").trim();
  const m = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!m) throw new Error("JSON inválido: " + raw);
  try {
    return JSON.parse(m[0]);
  } catch (e) {
    throw new Error("JSON inválido: " + raw);
  }
}

// Prompts

export async function gerarTopicos(materia, nivel) {
  const prompt = `Você é um professor brasileiro especialista no currículo da BNCC.
Liste de 6 a 8 tópicos/subtemas importantes da matéria "${materia}" para o nível "${nivel}" do ensino brasileiro.
Exemplos para Português: "Interpretação de Texto", "Verbos", "Substantivos", "Ortografia".
Responda SOMENTE com um array JSON de strings, sem markdown:
["Tópico 1", "Tópico 2", ...]`;
  return geminiJSON(prompt, { temperature: 0.7, maxOutputTokens: 300 });
}


//  gerarPergunta


let _poolBD = [];   // questões carregadas do BD
let _poolUsed = [];   // ids já usados na sessão

/* Deve ser chamado pelo quiz.js ao iniciar uma nova lição. */
export function resetPoolBD() {
  _poolBD = [];
  _poolUsed = [];
}

/**
 * Gera UMA pergunta. Tenta Gemini primeiro.
 * Se Gemini falhar, busca no BD (com fallback progressivo por tópico/matéria/nível).
 *
 * @param {string} materia    – nome da matéria (ex: "Matemática")
 * @param {string} nivel      – nível escolar (ex: "6º Ano")
 * @param {string} topico     – tópico (ex: "Verbos")
 * @param {string} materiaId  – id da matéria no Firestore (ex: "matematica")
 * @returns {Promise<object>} – { pergunta, opcoes, correta, dificuldade, explicacao, _fonte }
 */
export async function gerarPergunta(materia, nivel, topico, materiaId = "") {

  try {
    const prompt = `Você é um professor brasileiro especialista em educação básica.
Gere UMA pergunta de múltipla escolha sobre o tópico "${topico}" da matéria "${materia}" para o nível "${nivel}" do ensino brasileiro.

Responda SOMENTE com JSON válido, sem markdown:
{
  "pergunta": "Texto da pergunta?",
  "opcoes": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correta": 0,
  "dificuldade": "Fácil|Médio|Difícil",
  "explicacao": "Explicação educativa de por que a resposta é correta."
}
- "correta" é o índice 0–3
- Opções começam com A), B), C), D)
- Varie a dificuldade entre Fácil, Médio e Difícil`;

    const q = await geminiJSON(prompt, { temperature: 0.9, maxOutputTokens: 1200 });
    return { ...q, _fonte: "ia" };

  } catch (erroIA) {
    console.warn("[gerarPergunta] Gemini falhou:", erroIA.message);
  }

  // Fallback: banco de dados 
  notify("IA indisponível — buscando no banco de questões…");

  try {
    // Recarrega o pool se estiver vazio ou insuficiente
    if (_poolBD.length === 0) {
      notify("Carregando questões do banco…");
      const id = materiaId || materia.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");

      _poolBD = await buscarQuestoes(id, topico, nivel, 50, _poolUsed);
    }

    if (_poolBD.length === 0) {
      throw new Error("Banco de questões vazio para este contexto");
    }

    // Pega a próxima questão do pool (sem repetir)
    const disponíveis = _poolBD.filter(q => !_poolUsed.includes(q._id));

    // Se esgotou as disponíveis, reseta os usados (vai repetir, mas não trava)
    if (disponíveis.length === 0) {
      console.warn("[gerarPergunta] Pool esgotado, reiniciando ciclo.");
      _poolUsed = [];
      _poolBD = await buscarQuestoes(
        materiaId || materia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_"),
        topico, nivel, 50, []
      );
    }

    const pool = _poolBD.filter(q => !_poolUsed.includes(q._id));
    const questao = pool[Math.floor(Math.random() * pool.length)];
    _poolUsed.push(questao._id);

    notify(""); // limpa status
    console.log(`[gerarPergunta] Usando questão do BD: ${questao._id}`);

    return {
      pergunta: questao.pergunta,
      opcoes: questao.opcoes,
      correta: questao.correta,
      dificuldade: questao.dificuldade,
      explicacao: questao.explicacao,
      _fonte: "banco",  // sinaliza origem para o quiz exibir aviso opcional
    };

  } catch (erroBD) {
    console.error("[gerarPergunta] Banco também falhou:", erroBD.message);
    notify("Sem questões disponíveis no momento.");
    throw new Error("IA e banco de questões indisponíveis: " + erroBD.message);
  }
}