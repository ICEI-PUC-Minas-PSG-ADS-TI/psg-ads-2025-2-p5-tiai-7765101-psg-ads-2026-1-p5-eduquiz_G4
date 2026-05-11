
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




<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/9b5358e7240782cc0dc5734034ef409ff47df477/docs/images/Arquitetura.png" width="85%">


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


<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/946f7e3588da00f73585c4952da23d91b54055a3/docs/images/Login.png" width="85%">


**Descrição:** A tela apresenta campos de e-mail e senha, botão "Entrar" e link para criação de conta. Ao autenticar com sucesso via Firebase Auth, o usuário é redirecionado para o Dashboard. Mensagens de erro são exibidas inline caso as credenciais sejam inválidas.

---

### 🖥️ Tela 2 — Cadastro (RF-01)

**História associada:** Como novo estudante, quero criar uma conta na plataforma informando meu e-mail e senha para acessar as trilhas de aprendizado.




<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/092b62bacfbb20d7089ce750dc21faae1ea25985/docs/images/Cadastro.png" width="85%">

**Descrição:** Formulário com campos de nome, e-mail e senha. Ao confirmar, o usuário é registrado no Firebase Authentication e redirecionado para o Dashboard.

---

### 🖥️ Tela 3 — Trilhas de Aprendizado / Matérias (RF-04, RF-07)

**História associada:** Como estudante, quero visualizar as trilhas de aprendizado organizadas por matéria e nível escolar para escolher o conteúdo mais adequado ao meu ano.




<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/092b62bacfbb20d7089ce750dc21faae1ea25985/docs/images/Trilhas.png" width="85%">


**Descrição:** Layout em três colunas: barra lateral de navegação, lista de trilhas com barra de progresso percentual, e painel direito com os tópicos da matéria selecionada. Filtros por nível (Fund. I, Fund. II, Médio) no topo da lista. Ao clicar em "Iniciar" em um tópico, abre o modal de seleção de quantidade de questões (1–10).

---

### 🖥️ Tela 4 — Quiz / Questão (RF-05, RF-06)

**História associada:** Como estudante, quero responder perguntas geradas por IA e receber explicações após cada resposta para aprender com meus erros.



<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/092b62bacfbb20d7089ce750dc21faae1ea25985/docs/images/Quest%C3%A3o.png" width="85%">

<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/092b62bacfbb20d7089ce750dc21faae1ea25985/docs/images/Resposta.png" width="85%">

**Descrição:** Topbar com botão voltar, nome da matéria/tópico e pontuação atual. Barra de progresso indicando questão atual. Card central com o enunciado, badge de dificuldade e quatro alternativas (A/B/C/D). Após responder, exibe card de feedback (verde = acerto, vermelho = erro) com explicação detalhada e botão "Próxima questão". Ao finalizar todas as questões, exibe tela de resultado com XP conquistado.

---

### 🖥️ Tela 5 — Ranking (RF-09)

**História associada:** Como estudante, quero visualizar um ranking global com minha posição e a dos outros usuários para me motivar a estudar mais.


<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/092b62bacfbb20d7089ce750dc21faae1ea25985/docs/images/Ranking.png" width="85%">

**Descrição:** Layout em duas colunas. À esquerda: pódio visual com os 3 primeiros colocados e card com a posição e XP do usuário logado. À direita: leaderboard completo com campo de busca, ordenação e lista de todos os usuários com posição, avatar, e-mail e XP.

---

### 🖥️ Tela 6 — Histórico (RF-10, RF-11)

**História associada:** Como estudante, quero ver o histórico das minhas lições e revisar as questões respondidas para identificar meus pontos fracos.

<img src="https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/23a99619bba63f5bb8fd3bffabf0db3f62c72406/docs/images/Pagina_Historico.png" width="85%">




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


#### 📌 Plataforma Utilizada

O EduQuiz utiliza o **Firebase** como plataforma de backend, composta por:

| Serviço | Função |
|---|---|
| **Firebase Authentication** | Gerenciamento de autenticação de usuários (login/cadastro via e-mail e senha) |
| **Cloud Firestore** | Banco de dados NoSQL orientado a documentos, utilizado para armazenar todas as coleções do sistema |
| **API Gemini (Google AI)** | Geração de questões de múltipla escolha via Inteligência Artificial |

> ⚠️ **Nota:** Por se tratar de um banco NoSQL (Firestore), o modelo físico é representado por **coleções e documentos** ao invés de tabelas relacionais. Cada coleção equivale a uma "tabela" e cada documento equivale a um "registro", contendo campos com tipos de dados específicos.

---

#### 📊 Estrutura das Coleções no Firestore

##### 1. Coleção: `users`
Armazena os dados de perfil de cada usuário registrado no sistema.

| Campo | Tipo | Descrição | Restrição |
|---|---|---|---|
| `uid` | `string` | Identificador único do usuário (PK – gerado pelo Firebase Auth) | **PK**, obrigatório, único |
| `nome` | `string` | Nome completo do usuário | Obrigatório |
| `email` | `string` | E-mail do usuário | Obrigatório, único |
| `xp` | `number` | Total de pontos de experiência acumulados | Padrão: `0` |
| `nivel` | `number` | Nível atual do usuário no sistema | Padrão: `1` |
| `role` | `string` | Papel do usuário no sistema (`"user"` ou `"admin"`) | Padrão: `"user"` |
| `dataCriacao` | `timestamp` | Data e hora do registro da conta | Automático |

**Regras de acesso:** Cada usuário pode ler/escrever apenas seu próprio documento. Administradores (`role: "admin"`) possuem acesso ampliado via painel `/admin`.

---

##### 2. Coleção: `progresso`
Registra o progresso de estudo do usuário em cada matéria e tópico.

| Campo | Tipo | Descrição | Restrição |
|---|---|---|---|
| `id` | `string` | Identificador único do documento (PK – gerado automaticamente) | **PK**, obrigatório |
| `userId` | `string` | Referência ao `uid` do usuário em `users` | **FK → users.uid**, obrigatório |
| `materia` | `string` | Nome da matéria (ex: "Matemática", "Português") | Obrigatório |
| `topico` | `string` | Tópico específico dentro da matéria | Obrigatório |
| `nivelEscolar` | `string` | Nível escolar (ex: "Fundamental I", "Médio") | Obrigatório |
| `totalAcertos` | `number` | Quantidade total de respostas corretas | Padrão: `0` |
| `totalQuestoes` | `number` | Quantidade total de questões respondidas | Padrão: `0` |
| `percentual` | `number` | Percentual de acerto calculado `(totalAcertos / totalQuestoes) × 100` | Calculado |
| `concluido` | `boolean` | Indica se o tópico foi concluído pelo menos uma vez | Padrão: `false` |
| `ultimaAtualizacao` | `timestamp` | Data/hora da última atualização | Automático |

---

##### 3. Coleção: `historico`
Armazena o histórico de todas as lições realizadas pelo usuário, permitindo revisão.

| Campo | Tipo | Descrição | Restrição |
|---|---|---|---|
| `id` | `string` | Identificador único do documento (PK) | **PK**, obrigatório |
| `userId` | `string` | Referência ao `uid` do usuário em `users` | **FK → users.uid**, obrigatório |
| `materia` | `string` | Matéria da lição realizada | Obrigatório |
| `topico` | `string` | Tópico da lição | Obrigatório |
| `nivelEscolar` | `string` | Nível escolar selecionado | Obrigatório |
| `acertos` | `number` | Quantidade de respostas corretas na lição | Obrigatório |
| `totalQuestoes` | `number` | Total de questões da lição | Obrigatório |
| `pontuacao` | `number` | Pontuação obtida na lição (baseada na dificuldade) | Calculado |
| `questoes` | `array<object>` | Lista de questões respondidas (pergunta, alternativas, resposta do usuário, resposta correta, explicação) | Obrigatório |
| `data` | `timestamp` | Data/hora da conclusão da lição | Automático |

**Estrutura do objeto dentro do array `questoes`:**

| Subcampo | Tipo | Descrição |
|---|---|---|
| `pergunta` | `string` | Texto da pergunta |
| `alternativas` | `array<string>` | Lista de alternativas |
| `respostaUsuario` | `string` | Resposta escolhida pelo usuário |
| `respostaCorreta` | `string` | Resposta correta da questão |
| `explicacao` | `string` | Explicação educativa gerada pela IA |
| `acertou` | `boolean` | Se o usuário acertou ou não |

---

##### 4. Coleção: `questoes`
Banco de questões salvas no Firestore, usado como fallback quando a API Gemini está indisponível (RF-12).

| Campo | Tipo | Descrição | Restrição |
|---|---|---|---|
| `id` | `string` | Identificador único do documento (PK) | **PK**, obrigatório |
| `materia` | `string` | Matéria da questão | Obrigatório |
| `nivelEscolar` | `string` | Nível escolar | Obrigatório |
| `topico` | `string` | Tópico específico | Obrigatório |
| `dificuldade` | `string` | Nível de dificuldade (`"facil"`, `"medio"`, `"dificil"`) | Obrigatório |
| `pergunta` | `string` | Texto da pergunta | Obrigatório |
| `alternativas` | `array<string>` | Lista de 4 alternativas | Obrigatório, min: 4 |
| `respostaCorreta` | `string` | Alternativa correta | Obrigatório |
| `explicacao` | `string` | Explicação educativa | Obrigatório |
| `geradaPorIA` | `boolean` | Indica se a questão foi gerada automaticamente pela Gemini | Padrão: `true` |
| `dataCriacao` | `timestamp` | Data de criação/armazenamento da questão | Automático |

---

##### 5. Firebase Authentication (Controle de Acesso)
Gerenciado diretamente pelo serviço Firebase Authentication (não é uma coleção Firestore).

| Campo | Tipo | Descrição | Restrição |
|---|---|---|---|
| `uid` | `string` | Identificador único do usuário (PK) | **PK**, gerado automaticamente |
| `email` | `string` | E-mail do usuário | Obrigatório, único |
| `password` | `string` (hash) | Senha criptografada (gerenciada internamente pelo Firebase) | Obrigatório, min: 6 caracteres |
| `createdAt` | `timestamp` | Data de criação da conta | Automático |
| `lastLoginAt` | `timestamp` | Data do último login | Automático |

> 🔒 **Segurança:** As senhas nunca são armazenadas diretamente no Firestore. A autenticação é 100% delegada ao Firebase Authentication (RNF-02, R-05).

---

#### 🔗 Relacionamentos entre Coleções

| Origem | Destino | Tipo | Descrição |
|---|---|---|---|
| `progresso.userId` | `users.uid` | N:1 | Cada registro de progresso pertence a um único usuário |
| `historico.userId` | `users.uid` | N:1 | Cada registro de histórico pertence a um único usuário |
| `users.uid` | Firebase Auth `uid` | 1:1 | Cada documento de usuário está vinculado a uma conta no Firebase Authentication |
| `historico.questoes[]` | `questoes` | Referência lógica | As questões respondidas podem ter sido originadas do banco de fallback |

---

#### 📎 Diagrama Físico de Dados

<img width="1126" height="853" alt="WhatsApp Image 2026-05-10 at 23 28 08" src="https://github.com/user-attachments/assets/e7bc7f41-928e-4bb7-9b35-9bba5f08c7c5" />

*Diagrama gerado com base na estrutura real implementada no Firebase Firestore nas Sprints 2 e 3, evidenciando coleções, campos, tipos de dados, identificadores (PK) e referências entre documentos (FK).*

---

#### 🔧 Ferramentas Utilizadas

| Ferramenta | Uso |
|---|---|
| **DbDiagram.io / Lucidchart** | Geração do diagrama físico de dados |
| **Firebase Console** | Validação da estrutura real das coleções |

---

#### ✅ Checklist de Conformidade

- [x] O diagrama representa fielmente o banco implementado no Firebase Firestore.
- [x] Reflete exatamente as coleções criadas nas Sprints 2 e 3.
- [x] Não inclui coleções que não existam no código.
- [x] Contempla o controle de acesso de usuários (Firebase Authentication + campo `role`).
- [x] Respeita as convenções e restrições da plataforma Firebase/Firestore.
