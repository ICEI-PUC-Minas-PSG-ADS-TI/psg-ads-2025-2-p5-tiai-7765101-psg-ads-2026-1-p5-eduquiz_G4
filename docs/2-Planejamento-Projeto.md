# 2. Planejamento do Projeto

Esta seção apresenta como o grupo organizará o trabalho ao longo do semestre.  
O projeto adota uma metodologia ágil, simulando o ambiente de uma Software House.

---

### 🚨 Regra de Ouro: 

> ❗Não existe divisão entre “quem faz documento”, “quem faz Front-end” e “quem faz Back-end”.

<br>Todos os integrantes são **Desenvolvedores Full-Stack** e devem implementar **Fatias Verticais (Vertical Slices)**.

✔️ Cada membro deve entregar a funcionalidade completa:  
**Banco de Dados → API → Tela**

---

# 2.1 Sprints do Projeto

O projeto será realizado em **4 Sprints**, com entregas contínuas de código e documentação.

---

## 📅 Visão Geral

### 🟢 Sprint 1 – Setup, Hello World e Visão do Produto
- README com descrição do projeto
- ODS escolhida
- Backlog macro
- Repositório criado
- Banco de dados instanciado (vazio)
- Tela "Hello World" conectada à API

---

### 🟡 Sprint 2 – MVP (Primeira Fatia Vertical)
- Requisitos Funcionais documentados
- Script do Banco de Dados
- 1ª funcionalidade completa funcionando
- Dados sendo salvos no banco

⚠️ Se não salvar no banco, não pontua.

---

### 🔵 Sprint 3 – Core e Regras de Negócio
- Implementação das regras de negócio
- Validações no backend
- DER atualizado via Engenharia Reversa
- Diagrama de Classes atualizado

---

### 🔴 Sprint 4 – Finalização e Deploy
- Correção de bugs
- Testes finais ponta a ponta
- Documentação final consolidada
- Relatório preenchido no APC
- Sistema pronto para Arguição

---

## 👥 Papéis de Gestão

Todos programam.
Os papéis abaixo são apenas para organização do time.

* 👨‍💻 **Tech Lead (Git Master)**
  Responsável pela arquitetura principal, gestão do repositório e aprovação de *pull requests* (merges). Garante a integração contínua das funcionalidades do aplicativo, especialmente a comunicação com a Inteligência Artificial geradora de perguntas.

* 🗄️ **Arquiteto de Dados (DBA Guard)**
  Responsável pela modelagem e padronização do banco de dados. Estrutura de forma eficiente o armazenamento de perfis de usuários, progressão gamificada (níveis/recompensas), grade curricular (Ensino Fundamental e Médio) e o histórico de erros e acertos.

* 🧪 **Gerente de Qualidade (QA & Code Reviewer)**
  Responsável por revisar código e validar testes. Garante que o aplicativo seja intuitivo, livre de bugs e acessível para o público-alvo (estudantes de 6 a 18 anos), além de homologar se as explicações geradas pela IA estão claras e corretas.

* 📋 **Facilitador Ágil (PO / Scrum Master)**
  Responsável por prazos, gestão do Kanban e priorização do backlog. Assegura que o time foque nas entregas de maior valor educacional e de engajamento a cada ciclo, removendo impedimentos do caminho.

---

### Definição dos Papéis – Sprint 1

* 👨‍💻 **Tech Lead:** Robson
* 🗄️ **Arquiteto de Dados:** Pedro Henrique
* 🧪 **Gerente de Qualidade:** Felipe
* 📋 **Facilitador Ágil:** Lucas

> Caso os papéis mudem nas próximas Sprints, atualizar neste documento.

---

# 2.2 Execução e Controle

## 🗂️ Kanban (OBRIGATÓRIO)

O projeto pode utilizar a aba **Projects** do GitHub, porém é **OBRIGATÓRIO preencher os quadros Kanban de cada Sprint** (apresentados abaixo).

### Estrutura obrigatória do Board:

- A Fazer
- Desenvolver
- Fila para Teste
- Teste
- Feito

### Regras

- Cada cartão deve representar uma Fatia Vertical.
- Todo cartão deve conter:
  - Responsável
  - Descrição
  - Prazo
- A avaliação individual considerará:
  - Histórico de commits
  - Movimentação no Kanban

⚠️ Se não está no Git, não foi feito.

---

# 📋 Acompanhamento das Sprints

## Legenda de Status

- [x] ✔️ Concluído
- [ ] 📝 Em andamento
- [ ] ⌛ Atrasado
- [ ] ❌ Não iniciado

---

# 🟢 Sprint 1 – Setup

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
| Robson             |   Tech Lead     | Papéis de Gestão | 12/02 | 12/03 | ✔️ |
| Lucas            |  Facilitador Ágil      | Banco de Dados,Página de Login | 12/03 | 12/02 | ✔️ |
| Felipe            |  Gerente de Qualidade     |Quadro Kanban  | 12/02 | 12/03 | ✔️ |
| Pedro           |  Arquiteto de Dados      | Problema, Objetivos, Justificativa, Público-Avo  | 12/02 | 12/03 | ✔️ |

---

# 🟡 Sprint 2 – MVP

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|             |        | Gerar Script do Banco de Dados | 21/03 | 24/03 | ❌ |
|             |        | Desenvolver Fatia 1 (BD + API + Tela) | 22/03 | 30/03 | ❌ |
|             |        | Documentar Requisitos do MVP | 25/03 | 02/04 | ❌ |
|             |        | Revisão técnica e Merge | 02/04 | 05/04 | ❌ |

---

# 🔵 Sprint 3 – Core

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|             |        | Implementar Regra de Negócio Y | 06/04 | 15/04 | ❌ |
|             |        | Implementar Cálculo/Processo Z | 06/04 | 15/04 | ❌ |
|             |        | Atualizar DER via Engenharia Reversa | 16/04 | 20/04 | ❌ |
|             |        | Atualizar Diagrama de Classes | 16/04 | 23/04 | ❌ |

---

# 🔴 Sprint 4 – Finalização

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|             |        | Correção de bugs | 22/05 | 05/06 | ❌ |
|             |        | Finalizar relatórios e dashboards | 01/06 | 15/06 | ❌ |
|             |        | Preencher Relatório APC | 10/06 | 20/06 | ❌ |
|             |        | Testes finais e consolidar README | 15/06 | 25/06 | ❌ |

---
