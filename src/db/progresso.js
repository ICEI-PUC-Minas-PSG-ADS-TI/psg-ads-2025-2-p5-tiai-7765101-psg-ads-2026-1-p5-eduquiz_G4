


import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, collection, addDoc, getDocs,
  query, orderBy, updateDoc, serverTimestamp, where, limit,
  collectionGroup,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/**
  Busca o catálogo de matérias do Firestore.
  Se não existir, sobe o padrão de Português para testes.
 */
export async function getCatalogo() {
  const ref  = doc(db, "config", "materias");
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().lista ?? [];

  // Seed padrão (só Português) para testes
  const padrao = [
    {
      id:         "portugues",
      nome:       "Língua Portuguesa",
      emoji:      "📖",
      cor:        "#ef4444",
      escolaridade: "Fundamental II",
      nivel:      "6º Ano",
      nivelFiltro: "fund2",
      topicos: [
        "Interpretação de Texto",
        "Verbos",
        "Substantivos",
        "Adjetivos",
        "Ortografia",
        "Pontuação",
        "Geral",
      ],
    },
  ];

  await setDoc(ref, { lista: padrao });
  return padrao;
}

/*
 Retorna uma matéria específica pelo id.
 */
export async function getMateria(materiaId) {
  const lista = await getCatalogo();
  return lista.find(m => m.id === materiaId) ?? null;
}

// ══════════════════════════════════════════════════════════════
//  BANCO DE QUESTÕES  (questoes/)
// ══════════════════════════════════════════════════════════════

/*
 Salva uma questão gerada no banco global.
 Retorna o ID do documento criado.
 */
export async function salvarQuestao(questao) {
  const ref = await addDoc(collection(db, "questoes"), {
    materiaId:   questao.materiaId,
    materiaNome: questao.materiaNome,
    topico:      questao.topico,
    nivel:       questao.nivel,
    escolaridade: questao.escolaridade ?? "",
    pergunta:    questao.pergunta,
    opcoes:      questao.opcoes,
    correta:     questao.correta,
    dificuldade: questao.dificuldade,
    explicacao:  questao.explicacao,
    criadaEm:    serverTimestamp(),
  });
  return ref.id;
}

/*
 * Busca questões do banco com fallback progressivo:
  1. matéria + tópico exato
  2. matéria + tópico "Geral"
  3. só matéria (qualquer tópico)
  4. só nível (qualquer matéria)
 
 Nunca repete questões já usadas na mesma sessão (usedIds).
 */
export async function buscarQuestoes(materiaId, topico, nivel = "", quantidade = 5, usedIds = []) {
  const embaralha = (arr) => arr.sort(() => Math.random() - 0.5);
  const semUsadas = (arr) => arr.filter(d => !usedIds.includes(d._id ?? d.id));

  async function buscar(constraints) {
    const q    = query(collection(db, "questoes"), ...constraints, limit(quantidade * 5));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  }

  // 1. Matéria + tópico exato
  let docs = semUsadas(embaralha(
    await buscar([where("materiaId","==",materiaId), where("topico","==",topico)])
  ));
  if (docs.length >= quantidade) return docs.slice(0, quantidade);

  // 2. Matéria + "Geral" (se tópico não for Geral)
  if (topico !== "Geral") {
    const geral = semUsadas(embaralha(
      await buscar([where("materiaId","==",materiaId), where("topico","==","Geral")])
    ));
    docs = embaralha([...docs, ...geral.filter(g => !docs.some(d => d._id === g._id))]);
    if (docs.length >= quantidade) return docs.slice(0, quantidade);
  }

  // 3. Só matéria (qualquer tópico)
  const qualquerTopico = semUsadas(embaralha(
    await buscar([where("materiaId","==",materiaId)])
  ));
  docs = embaralha([...docs, ...qualquerTopico.filter(q => !docs.some(d => d._id === q._id))]);
  if (docs.length >= quantidade) return docs.slice(0, quantidade);

  // 4. Só nível (qualquer matéria) — último recurso
  if (nivel) {
    const porNivel = semUsadas(embaralha(
      await buscar([where("nivel","==",nivel)])
    ));
    docs = embaralha([...docs, ...porNivel.filter(p => !docs.some(d => d._id === p._id))]);
  }

  return docs.slice(0, quantidade);
}


//  TÓPICOS DO USUÁRIO  (cache por usuário)

function materiaRef(uid, mid)       { return doc(db, "usuarios", uid, "materias", mid); }
function licoesRef(uid, mid)        { return collection(db, "usuarios", uid, "materias", mid, "licoes"); }
function licaoRef(uid, mid, lid)    { return doc(db, "usuarios", uid, "materias", mid, "licoes", lid); }

export async function getTopicos(uid, materiaId) {
  // Primeiro tenta no catálogo global (fonte principal)
  const mat = await getMateria(materiaId);
  if (mat?.topicos?.length) return mat.topicos;

  // Fallback: cache por usuário 
  const snap = await getDoc(materiaRef(uid, materiaId));
  return snap.exists() ? (snap.data().topicos ?? null) : null;
}

export async function salvarTopicos(uid, materiaId, topicos) {
  await setDoc(materiaRef(uid, materiaId), { topicos }, { merge: true });
}


//  LIÇÕES DO USUÁRIO


export async function getLicoes(uid, materiaId) {
  const q    = query(licoesRef(uid, materiaId), orderBy("criadaEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
  Cria uma nova lição e retorna o ID.
  @param {number} totalQuestoes  – quantas questões o usuário escolheu (1-10)
 */
export async function criarLicao(uid, materiaId, topico, totalQuestoes = 5) {
  const ref = await addDoc(licoesRef(uid, materiaId), {
    topico,
    totalQuestoes,
    criadaEm:  serverTimestamp(),
    concluida: false,
    acertos:   0,
    total:     0,
  });
  return ref.id;
}

export async function concluirLicao(uid, materiaId, licaoId, acertos, total) {
  await updateDoc(licaoRef(uid, materiaId, licaoId), {
    concluida: true,
    acertos,
    total,
  });
}

export async function getProgressoMateria(uid, materiaId) {
  const licoes     = await getLicoes(uid, materiaId);
  const concluidas = licoes.filter(l => l.concluida);

  if (!concluidas.length)
    return { porcentagem: 0, licoesFeitas: 0, totalLicoes: licoes.length };

  const acertos = concluidas.reduce((s, l) => s + (l.acertos ?? 0), 0);
  const total   = concluidas.reduce((s, l) => s + (l.total   ?? 1), 0);

  return {
    porcentagem:  Math.round((acertos / total) * 100),
    licoesFeitas: concluidas.length,
    totalLicoes:  licoes.length,
  };
}

// ══════════════════════════════════════════════════════════════
//  RESPOSTAS POR LIÇÃO  (usuarios/{uid}/materias/{mid}/licoes/{lid}/respostas/)
//
//  Cada documento salva uma questão respondida:
//    pergunta, opcoes[], correta, respostaUsuario,
//    acertou (bool), dificuldade, explicacao,
//    topico, materiaNome, materiaId, nivel,
//    respondidaEm (timestamp)
// ══════════════════════════════════════════════════════════════

function respostasRef(uid, materiaId, licaoId) {
  return collection(db, "usuarios", uid, "materias", materiaId, "licoes", licaoId, "respostas");
}

/**
 * Salva a resposta de uma questão dentro de uma lição.
 */
export async function salvarResposta(uid, materiaId, licaoId, resposta) {
  await addDoc(respostasRef(uid, materiaId, licaoId), {
    pergunta:        resposta.pergunta,
    opcoes:          resposta.opcoes,
    correta:         resposta.correta,
    respostaUsuario: resposta.respostaUsuario,
    acertou:         resposta.acertou,
    dificuldade:     resposta.dificuldade  ?? "Médio",
    explicacao:      resposta.explicacao   ?? "",
    topico:          resposta.topico       ?? "",
    materiaNome:     resposta.materiaNome  ?? "",
    materiaId:       materiaId,
    nivel:           resposta.nivel        ?? "",
    respondidaEm:    serverTimestamp(),
  });
}

/**
 * Busca todas as respostas de uma lição específica.
 */
export async function getRespostasDaLicao(uid, materiaId, licaoId) {
  // Sem orderBy para evitar erro de índice composto — ordena no JS
  const snap = await getDocs(respostasRef(uid, materiaId, licaoId));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.respondidaEm?.toMillis?.() ?? (a.respondidaEm?.seconds ?? 0) * 1000;
      const tb = b.respondidaEm?.toMillis?.() ?? (b.respondidaEm?.seconds ?? 0) * 1000;
      return ta - tb;
    });
}

/**
 * Busca o histórico completo do usuário em todas as matérias.
 * Retorna lições com metadados agregados, ordenadas por data (mais recente primeiro).
 * Limita a 100 lições para performance.
 */
export async function getHistoricoCompleto(uid) {
  // Busca todas as matérias que o usuário já acessou
  const materiasSnap = await getDocs(collection(db, "usuarios", uid, "materias"));

  if (materiasSnap.empty) return [];

  const todasLicoes = [];

  // Para cada matéria, busca todas as lições (sem orderBy para evitar índice composto)
  await Promise.all(materiasSnap.docs.map(async (matDoc) => {
    const materiaId = matDoc.id;
    try {
      // Sem orderBy aqui — ordenamos no JS depois
      const snap = await getDocs(licoesRef(uid, materiaId));
      snap.docs.forEach(d => {
        const data = d.data();
        // Inclui concluídas E não concluídas — filtra depois
        todasLicoes.push({
          id:        d.id,
          materiaId,
          ...data,
        });
      });
    } catch (e) {
      console.warn("Erro ao buscar lições de", materiaId, e);
    }
  }));

  // Filtra apenas concluídas, ordena por data desc, limita a 100
  return todasLicoes
    .filter(l => l.concluida === true)
    .sort((a, b) => {
      // criadaEm pode ser Timestamp do Firestore ou null
      const ta = a.criadaEm?.toMillis?.() ?? a.criadaEm?.seconds * 1000 ?? 0;
      const tb = b.criadaEm?.toMillis?.() ?? b.criadaEm?.seconds * 1000 ?? 0;
      return tb - ta;
    })
    .slice(0, 100);
}