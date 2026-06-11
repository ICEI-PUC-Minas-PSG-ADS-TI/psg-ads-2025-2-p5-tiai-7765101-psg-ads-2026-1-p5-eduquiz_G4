# 5. Interface do Sistema

> Esta seção é o **Portfólio Visual** do EduQuiz, registrando a evolução real da interface a cada Sprint — do primeiro login até o ranking global.

---

## 5.1. Galeria de Telas (Por Sprint)

---

### 🟢 Sprint 1 — Login e Cadastro

**Funcionalidade:** Autenticação de usuários via Firebase Authentication (RF-01 e RF-02).

**Descrição:** Ponto de entrada do sistema. O usuário pode criar uma conta informando e-mail e senha, ou fazer login caso já seja cadastrado. Após autenticação bem-sucedida, é redirecionado automaticamente para o dashboard de matérias. Mensagens de erro são exibidas inline para credenciais inválidas ou e-mail já cadastrado.

#### Tela de Login
> Formulário com campos de e-mail e senha, botão "Entrar" e link para a tela de cadastro.

![Tela de Login](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/0e59e3fb86a43393d05153cf67df1756e62c8acc/docs/images/login.png)

#### Tela de Cadastro
> Formulário de criação de conta com e-mail e senha. Ao confirmar, o usuário é registrado no Firebase e redirecionado para o dashboard.

![Tela de Cadastro](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/0e59e3fb86a43393d05153cf67df1756e62c8acc/docs/images/cadastro.png)

---

### 🟡 Sprint 2 — Quiz, Matérias e Respostas

**Funcionalidade:** Fluxo completo de aprendizado — seleção de matéria, geração de lição por IA e resposta de questões com feedback (RF-04, RF-05, RF-06, RF-07, RF-08, RF-12).

**Descrição:** Primeira fatia vertical completa do sistema. O usuário escolhe uma matéria e nível escolar, seleciona um tópico, define a quantidade de questões (1 a 10) e inicia a lição. As questões são geradas em tempo real pela API Gemini. Após cada resposta, o sistema exibe feedback visual (verde = acerto, vermelho = erro) com explicação educativa detalhada. Ao final, a lição é salva no Firestore com acertos, erros e pontuação.

#### Tela de Matérias (Trilhas de Aprendizado)
> Grade de matérias organizadas por nível escolar (Fundamental I, Fundamental II, Médio) com barra de progresso percentual de cada disciplina.

![Tela de Matérias](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/Materias.png)

#### Tela do Quiz — Questão
> Card com o enunciado da questão gerada pela IA, badge de dificuldade (Fácil/Médio/Difícil), barra de progresso e quatro alternativas (A/B/C/D). Pontuação atual exibida na topbar.

![Tela de Questão](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/Quest%C3%A3o.png)

#### Tela do Quiz — Feedback
> Após responder corretamente, exibe card verde com ícone de acerto e explicação educativa da resposta. Botão "Próxima questão" avança o fluxo.]
> Após responder incorretamente, exibe card vermelho com a resposta correta destacada e explicação do motivo do erro.

![Feedback Acerto](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/Acerto.png)

#### Tela de Resultado Final da Lição
> Exibe o total de acertos, pontuação conquistada em XP e opções para iniciar uma nova lição no mesmo tópico ou voltar para as matérias.

![Resultado da Lição](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/Fim_Quiz.png)

---

### 🔵 Sprint 3 — Home Page e Histórico

**Funcionalidade:** Landing page do sistema e histórico completo de lições com revisão de questões (RF-10 e RF-11).

**Descrição:** Entrega da interface pública do EduQuiz (home page) e do módulo de histórico — a tela de maior complexidade de regras de negócio do sistema. O histórico percorre todas as matérias do usuário no Firestore, calcula taxa de acertos por lição, permite filtrar por resultado (acerto/erro) e buscar por matéria ou tópico. Ao clicar em uma lição, abre um modal de revisão completa com todas as questões respondidas, gabarito e explicações.

#### Home Page (Landing Page)
> Página pública com apresentação do EduQuiz, funcionalidades, matérias cobertas, sistema de pontuação e botões de acesso para login e cadastro.

![Home Page](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/homepage.png)

#### Tela de Histórico
> Barra de resumo com total de lições concluídas, acertos, erros e taxa de aproveitamento geral. Lista de lições com indicador circular de desempenho, matéria, tópico e data.
> Chips de filtro por resultado (Todas / Acertos / Erros) e campo de busca por matéria ou tópico aplicados dinamicamente sobre a lista de lições

![Histórico Geral](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/Historico.png)


---

### 🔴 Sprint 4 — Ranking Global

**Funcionalidade:** Ranking global de usuários ordenados por XP com pódio dos 3 primeiros (RF-09 e RN-05).

**Descrição:** Tela final que fecha o ciclo de gamificação do EduQuiz. Exibe o pódio visual com os 3 primeiros colocados e um leaderboard completo com todos os usuários, suas posições, avatares e XP acumulado. O XP é calculado com base no total de acertos de todas as lições concluídas em todas as matérias. A posição e XP do usuário logado são destacados no ranking.

#### Tela de Ranking
> Pódio visual com os 3 primeiros colocados (ouro, prata e bronze), exibindo avatar, e-mail e XP de cada um.

![Ranking Pódio](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2025-2-p5-tiai-7765101-psg-ads-2026-1-p5-eduquiz_G4/blob/bbf4ef21546898643ceb87fa14213f2e792a4ac4/docs/images/Ranking.png)
