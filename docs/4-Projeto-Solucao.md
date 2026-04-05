
# 4. Projeto da Solução

> ⚠️ **Aviso aos Squads (Software House)**
>
> Esta seção **não deve ser preenchida integralmente antes da codificação**.
> Trata-se de um **Documento Vivo**, que deverá ser atualizado **incrementalmente a cada Sprint**, refletindo fielmente o código real implementado.

---

## 4.1 Arquitetura da Solução (Sprint 1 e 2)

O **EduQuiz** segue uma arquitetura de **aplicação web estática com serviços em nuvem**, onde o front-end se comunica diretamente com as APIs externas (Firebase e Gemini), sem servidor próprio intermediário.

O fluxo principal é:

**Usuário (Navegador) → Front-end (HTML/CSS/JS) → Firebase Auth & Firestore → API Gemini (IA)**



### 📎 Diagrama de Arquitetura do Projeto

> 🚨 Insira aqui a imagem do diagrama de arquitetura do grupo.

```
[IMAGEM: diagrama_arquitetura.png]
```

*Sugestão: utilize Draw.io, Lucidchart ou Figma para criar o diagrama e substitua o bloco acima pela imagem.*

---

🔧 **Ferramentas recomendadas para o diagrama:**
- [Draw.io](https://draw.io)
- [Lucidchart](https://lucidchart.com)
- [Figma](https://figma.com)

---

## 4.2 Tecnologias Utilizadas (Sprint 1)

| Dimensão | Tecnologia Escolhida |
|----------|----------------------|
| Banco de Dados (SGBD) | Firebase Firestore (NoSQL — documentos JSON em nuvem) |
| Autenticação | Firebase Authentication (e-mail e senha) |
| Back-end / API de IA | Google Gemini API (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`) |
| Front-end | HTML5 + CSS3 + JavaScript (ES6 Modules) |
| Hospedagem / Deploy | Firebase Hosting / GitHub Pages |
| Gestão e Versionamento | GitHub e GitHub Projects (Kanban) |
| Fontes e UI | Google Fonts (Nunito) |

> ⚠️ **Observação:** O sistema não possui back-end próprio. Toda a lógica de negócio reside no front-end, com chamadas diretas às APIs do Firebase e Gemini. GitHub Pages é compatível com esta arquitetura pois não há servidor Node/Python/etc.

---

## 4.3 Wireframes ou Mockups (A partir da Sprint 2)

Os wireframes a seguir representam as telas principais do EduQuiz, associadas aos seus respectivos Requisitos Funcionais e Histórias de Usuário.

---

### 🖥️ Tela 1 — Login (RF-02)

**História associada:** Como estudante cadastrado, quero fazer login com meu e-mail e senha para acessar minha conta e continuar de onde parei.

> 🚨 Insira aqui o wireframe/mockup da tela de Login.

```
[IMAGEM: wireframe_login.png]
```

**Descrição:** A tela apresenta campos de e-mail e senha, botão "Entrar" e link para criação de conta. Ao autenticar com sucesso via Firebase Auth, o usuário é redirecionado para o Dashboard. Mensagens de erro são exibidas inline caso as credenciais sejam inválidas.

---

### 🖥️ Tela 2 — Cadastro (RF-01)

**História associada:** Como novo estudante, quero criar uma conta na plataforma informando meu e-mail e senha para acessar as trilhas de aprendizado.

> 🚨 Insira aqui o wireframe/mockup da tela de Cadastro.

```
[IMAGEM: wireframe_cadastro.png]
```

**Descrição:** Formulário com campos de nome, e-mail e senha. Ao confirmar, o usuário é registrado no Firebase Authentication e redirecionado para o Dashboard.

---

### 🖥️ Tela 3 — Trilhas de Aprendizado / Matérias (RF-04, RF-07)

**História associada:** Como estudante, quero visualizar as trilhas de aprendizado organizadas por matéria e nível escolar para escolher o conteúdo mais adequado ao meu ano.

> 🚨 Insira aqui o wireframe/mockup da tela de Trilhas.

```
[IMAGEM: wireframe_materias.png]
```

**Descrição:** Layout em três colunas: barra lateral de navegação, lista de trilhas com barra de progresso percentual, e painel direito com os tópicos da matéria selecionada. Filtros por nível (Fund. I, Fund. II, Médio) no topo da lista. Ao clicar em "Iniciar" em um tópico, abre o modal de seleção de quantidade de questões (1–10).

---

### 🖥️ Tela 4 — Quiz / Questão (RF-05, RF-06)

**História associada:** Como estudante, quero responder perguntas geradas por IA e receber explicações após cada resposta para aprender com meus erros.

> 🚨 Insira aqui o wireframe/mockup da tela de Quiz.

```
[IMAGEM: wireframe_quiz.png]
```

**Descrição:** Topbar com botão voltar, nome da matéria/tópico e pontuação atual. Barra de progresso indicando questão atual. Card central com o enunciado, badge de dificuldade e quatro alternativas (A/B/C/D). Após responder, exibe card de feedback (verde = acerto, vermelho = erro) com explicação detalhada e botão "Próxima questão". Ao finalizar todas as questões, exibe tela de resultado com XP conquistado.

---

### 🖥️ Tela 5 — Ranking (RF-09)

**História associada:** Como estudante, quero visualizar um ranking global com minha posição e a dos outros usuários para me motivar a estudar mais.

> 🚨 Insira aqui o wireframe/mockup da tela de Ranking.

```
[IMAGEM: wireframe_ranking.png]
```

**Descrição:** Layout em duas colunas. À esquerda: pódio visual com os 3 primeiros colocados e card com a posição e XP do usuário logado. À direita: leaderboard completo com campo de busca, ordenação e lista de todos os usuários com posição, avatar, e-mail e XP.

---

### 🖥️ Tela 6 — Histórico (RF-10, RF-11)

**História associada:** Como estudante, quero ver o histórico das minhas lições e revisar as questões respondidas para identificar meus pontos fracos.

> 🚨 Insira aqui o wireframe/mockup da tela de Histórico.

```
[IMAGEM: wireframe_historico.png]
```

**Descrição:** Barra de resumo geral (lições concluídas, acertos, erros, taxa de acerto). Filtros por resultado e campo de busca. Lista de lições com indicador circular de aproveitamento, nome da matéria, tópico e data. Ao clicar em uma lição, abre modal de revisão com todas as questões respondidas, gabarito e explicações.

---

🔧 **Ferramentas sugeridas para os wireframes:**
- [Figma](https://figma.com)
- [MarvelApp](https://marvelapp.com)
- [Balsamiq](https://balsamiq.com)

---

## 4.4 Modelagem de Dados (Sprint 2 e 3)

O EduQuiz utiliza o **Firebase Firestore** como banco de dados NoSQL. Os dados são organizados em coleções e subcoleções de documentos JSON.

---

### 4.4.1 Estrutura do Banco de Dados (NoSQL — Firestore)

O Firestore organiza os dados em **coleções** (equivalente a tabelas) e **documentos** (equivalente a linhas). Abaixo está a estrutura completa utilizada pelo sistema.

---

#### 🔹 Coleção: `config`

Armazena as configurações globais da plataforma.

**Documento: `config/materias`**

```json
{
  "lista": [
    {
      "id": "portugues",
      "nome": "Língua Portuguesa",
      "emoji": "📖",
      "cor": "#ef4444",
      "escolaridade": "Fundamental II",
      "nivel": "6º Ano",
      "nivelFiltro": "fund2",
      "topicos": [
        "Interpretação de Texto",
        "Verbos",
        "Substantivos",
        "Adjetivos",
        "Ortografia",
        "Pontuação",
        "Geral"
      ]
    }
  ]
}
```

---

#### 🔹 Coleção: `questoes`

Banco global de questões geradas pela IA e salvas para uso como fallback.

**Documento: `questoes/{questaoId}`**

```json
{
  "materiaId": "portugues",
  "materiaNome": "Língua Portuguesa",
  "topico": "Verbos",
  "nivel": "6º Ano",
  "escolaridade": "Fundamental II",
  "pergunta": "Qual é o verbo na frase 'O aluno estudou muito'?",
  "opcoes": [
    "A) aluno",
    "B) estudou",
    "C) muito",
    "D) O"
  ],
  "correta": 1,
  "dificuldade": "Fácil",
  "explicacao": "O verbo é a palavra que indica ação, estado ou fenômeno. 'Estudou' indica a ação praticada pelo sujeito.",
  "criadaEm": "2025-01-01T00:00:00Z"
}
```

---

#### 🔹 Coleção: `usuarios`

Armazena os dados de cada usuário autenticado e seu progresso.

**Documento: `usuarios/{uid}`**

```json
{
  "email": "aluno@email.com",
  "avatar": "A",
  "badges": ["primeiro_passo", "fogo_3_dias"]
}
```

---

#### 🔹 Subcoleção: `usuarios/{uid}/materias`

Armazena os tópicos (cache) de cada matéria acessada pelo usuário.

**Documento: `usuarios/{uid}/materias/{materiaId}`**

```json
{
  "topicos": [
    "Interpretação de Texto",
    "Verbos",
    "Substantivos",
    "Geral"
  ]
}
```

---

#### 🔹 Subcoleção: `usuarios/{uid}/materias/{materiaId}/licoes`

Registra cada lição iniciada e concluída pelo usuário.

**Documento: `usuarios/{uid}/materias/{materiaId}/licoes/{licaoId}`**

```json
{
  "topico": "Verbos",
  "totalQuestoes": 5,
  "concluida": true,
  "acertos": 4,
  "total": 5,
  "criadaEm": "2025-01-01T00:00:00Z"
}
```

---

#### 🔹 Subcoleção: `usuarios/{uid}/materias/{materiaId}/licoes/{licaoId}/respostas`

Detalha cada questão respondida dentro de uma lição (usado no histórico/revisão).

**Documento: `usuarios/{uid}/materias/{materiaId}/licoes/{licaoId}/respostas/{respostaId}`**

```json
{
  "pergunta": "Qual é o verbo na frase 'O aluno estudou muito'?",
  "opcoes": ["A) aluno", "B) estudou", "C) muito", "D) O"],
  "correta": 1,
  "respostaUsuario": 1,
  "acertou": true,
  "dificuldade": "Fácil",
  "explicacao": "O verbo é a palavra que indica ação...",
  "topico": "Verbos",
  "materiaNome": "Língua Portuguesa",
  "materiaId": "portugues",
  "nivel": "6º Ano",
  "respondidaEm": "2025-01-01T00:00:00Z"
}
```

---
### 📁 Obrigatório

O arquivo .sql ou .js deve ser salvo na pasta: src/bd

 - É permitido colar um trecho do script no README apenas para visualização rápida.
 
---
### 4.4.2 Representação do Modelo Físico de Dados (Entrega na Sprint 3 - Core)


> **Fundamentação:** Os modelos de dados físicos fornecem detalhes minuciosos que auxiliam administradores e desenvolvedores na implementação da lógica de negócios em um banco de dados real.
> Eles incluem elementos não especificados no modelo lógico, como:
> - Tipos de dados específicos da plataforma
> - Restrições
> - Índices
> - Triggers (quando aplicável)
> - Procedimentos armazenados (quando aplicável)
>
>Por representarem um banco real, devem respeitar:
> - Convenções de nomenclatura
> - Restrições da plataforma
> - Uso adequado de palavras reservadas <br>


**Exemplo:**

<img src="https://d2908q01vomqb2.cloudfront.net/b6692ea5df920cad691c20319a6fffd7a4a766b8/2021/11/09/BDB-1321-image005.png" width="85%">

**FONTE:** <https://aws.amazon.com/pt/compare/the-difference-between-logical-and-physical-data-model/>

<br>O grupo deverá gerar um diagrama físico do banco de dados (estrutura real das tabelas), evidenciando PKs, FKs e relacionamentos, conforme implementado no código.

Este modelo deve exibir:
- Tabelas ou coleções existentes
- Atributos com seus respectivos tipos de dados
- Chaves Primárias (PK)
- Chaves Estrangeiras (FK)
- Relacionamentos entre tabelas
- Restrições implementadas (quando aplicável)

---

### 📌 Requisitos Obrigatórios

- O diagrama deve representar fielmente o banco já implementado.
- Deve refletir exatamente o que foi criado nas Sprints 2 e 3.
- Não incluir tabelas que não existam no código.
- Deve contemplar o controle de acesso de usuários, quando implementado.
- Deve respeitar as convenções e restrições da plataforma utilizada.

---

### 📎 Representação do Modelo Físico de Dados
🚨 O grupo deverá inserir aqui a imagem do diagrama físico de dados.

---
🔧**Ferramentas Sugeridas**
- MySQL Workbench (engenharia reversa automática)
- DbDesigner
- Lucidchart
