
# 3. Especificações do Projeto

📌 **Pré-requisito:** Planejamento do Projeto (Cronograma e Sprints definidos).

Nesta seção serão detalhados:

- ✅ Requisitos Funcionais  
- ✅ Histórias de Usuário  
- ✅ Requisitos Não Funcionais  
- ✅ Restrições do Projeto  

O objetivo é organizar claramente as funcionalidades, qualidades e limites da solução.

---

# 3.1 Requisitos Funcionais

Os **Requisitos Funcionais (RF)** descrevem o que o sistema deve fazer.

📌 Cada requisito deve:
- Representar uma funcionalidade única
- Ser claro e objetivo
- Orientar diretamente o desenvolvimento

---

## Tabela de Requisitos Funcionais

| ID | Descrição do Requisito | Prioridade |
|----|------------------------|------------|
| RF-01 | O sistema deve permitir que o usuário crie uma conta informando nome, e-mail e senha. | 🔴 ALTA |
| RF-02 | O sistema deve permitir que o usuário faça login com e-mail e senha cadastrados. | 🔴 ALTA |
| RF-03 | O sistema deve redirecionar o usuário autenticado automaticamente para o dashboard ao acessar a página de login. | 🔴 ALTA |
| RF-04 | O sistema deve exibir as trilhas de aprendizado organizadas por matéria e nível escolar (Fundamental I, Fundamental II, Médio). | 🔴 ALTA |
| RF-05 | O sistema deve gerar perguntas de múltipla escolha automaticamente utilizando a API Gemini (IA), com base na matéria, nível e tópico selecionados. | 🔴 ALTA |
| RF-06 | O sistema deve exibir uma explicação educativa ao usuário após cada resposta, indicando se acertou ou errou e o motivo. | 🔴 ALTA |
| RF-07 | O sistema deve permitir que o usuário selecione a quantidade de questões por lição (de 1 a 10). | 🟡 MÉDIA |
| RF-08 | O sistema deve registrar o progresso do usuário por matéria, calculando a porcentagem de acertos das lições concluídas. | 🔴 ALTA |
| RF-09 | O sistema deve exibir um ranking global com todos os usuários ordenados por XP (acertos totais), incluindo pódio com os 3 primeiros. | 🟡 MÉDIA |
| RF-10 | O sistema deve exibir o histórico de lições concluídas pelo usuário, com filtros por resultado (acerto/erro) e busca por matéria ou tópico. | 🟡 MÉDIA |
| RF-11 | O sistema deve permitir que o usuário revise todas as questões respondidas em uma lição anterior, com gabarito e explicações. | 🟡 MÉDIA |
| RF-12 | O sistema deve utilizar um banco de questões salvas no Firestore como fallback caso a IA esteja indisponível. | 🔴 ALTA |
| RF-13 | O sistema deve gerar automaticamente os tópicos de cada matéria utilizando IA, com base no currículo da BNCC. | 🟡 MÉDIA |
| RF-14 | O sistema deve permitir que o usuário encerre a sessão (logout). | 🔴 ALTA |
 
---

# 3.2 Histórias de Usuário

Cada história deve seguir o padrão ensinado na disciplina:

> **Como** [persona],  
> **eu quero** [funcionalidade],  
> **para que** [benefício].

⚠️ **ATENÇÃO:**  
Cada História de Usuário deve estar associada a um Requisito Funcional específico (RF-XX).

---

## Exemplos

**História 1 (relacionada ao RF-01):**  
Como usuário, quero registrar minhas tarefas para não esquecer de fazê-las.

**História 2 (relacionada ao RF-02):**  
Como administrador, quero alterar permissões para controlar o acesso ao sistema.

---

## Histórias do Projeto

---

### História 1 (relacionada ao RF-01)
 
Como **novo estudante**,  
eu quero **criar uma conta na plataforma informando meu e-mail e senha**,  
para que **eu possa acessar as trilhas de aprendizado e registrar meu progresso**.
 
---
 
### História 2 (relacionada ao RF-02)
 
Como **estudante cadastrado**,  
eu quero **fazer login com meu e-mail e senha**,  
para que **eu possa acessar minha conta e continuar de onde parei**.
 
---
 
### História 3 (relacionada ao RF-04)
 
Como **estudante**,  
eu quero **visualizar as trilhas de aprendizado organizadas por matéria e nível escolar**,  
para que **eu possa escolher o conteúdo mais adequado ao meu ano escolar**.
 
---
 
### História 4 (relacionada ao RF-05)
 
Como **estudante**,  
eu quero **responder perguntas geradas automaticamente por IA sobre o tópico escolhido**,  
para que **eu tenha questões variadas a cada lição, sem repetição de conteúdo**.
 
---
 
### História 5 (relacionada ao RF-06)
 
Como **estudante**,  
eu quero **receber uma explicação detalhada após cada resposta**,  
para que **eu entenda o motivo do meu erro e aprenda com ele**.
 
---
 
### História 6 (relacionada ao RF-08)
 
Como **estudante**,  
eu quero **acompanhar meu progresso percentual em cada matéria**,  
para que **eu saiba o quanto já avancei e o que ainda preciso estudar**.
 
---
 
### História 7 (relacionada ao RF-09)
 
Como **estudante**,  
eu quero **visualizar um ranking global com minha posição e a dos outros usuários**,  
para que **eu me motive a estudar mais e comparecer entre os melhores**.
 
---
 
### História 8 (relacionada ao RF-10 e RF-11)
 
Como **estudante**,  
eu quero **ver o histórico das minhas lições e revisar as questões respondidas**,  
para que **eu possa identificar meus pontos fracos e revisar o conteúdo quando necessário**.
 
---
 
### História 9 (relacionada ao RF-12)
 
Como **estudante**,  
eu quero **continuar respondendo questões mesmo quando a IA estiver indisponível**,  
para que **meu aprendizado não seja interrompido por problemas técnicos externos**.
 
---
 
### História 10 (relacionada ao RF-14)
 
Como **estudante**,  
eu quero **encerrar minha sessão na plataforma**,  
para que **minha conta permaneça segura ao compartilhar o dispositivo com outras pessoas**.

---

> 💡 Dica: Agrupe as histórias por módulo (Cadastro, Relatórios, Pagamentos, etc.) para melhor organização.

---

# 3.3 Requisitos Não Funcionais

Os **Requisitos Não Funcionais (RNF)** definem características de qualidade do sistema, como:

- ⚡ Desempenho  
- 🔒 Segurança  
- 🎨 Usabilidade  
- 📈 Escalabilidade  
- 🌐 Compatibilidade  

Eles garantem a qualidade da solução.

---

## Tabela de Requisitos Não Funcionais

| ID | Descrição do Requisito | Prioridade |
|----|------------------------|------------|
| RNF-01 | O sistema deve carregar as páginas principais em até 3 segundos em conexões padrão. | 🟡 MÉDIA |
| RNF-02 | O sistema deve proteger os dados dos usuários utilizando autenticação segura via Firebase Authentication. | 🔴 ALTA |
| RNF-03 | O sistema deve ser responsivo, funcionando corretamente em dispositivos móveis (smartphones e tablets) e desktops. | 🔴 ALTA |
| RNF-04 | O sistema deve ser compatível com os principais navegadores modernos (Chrome, Firefox, Edge, Safari). | 🟡 MÉDIA |
| RNF-05 | O sistema deve implementar fallback automático entre os modelos da IA (Gemini 2.5 Flash → 2.0 Flash → 2.0 Flash Lite) para garantir disponibilidade. | 🔴 ALTA |
| RNF-06 | As requisições à API Gemini devem ter timeout de no máximo 15 segundos para evitar travamentos na interface. | 🟡 MÉDIA |
| RNF-07 | O sistema deve ter interface intuitiva com uso de ícones, cores e feedback visual claro para usuários entre 6 e 18 anos. | 🔴 ALTA |
| RNF-08 | O sistema deve armazenar os dados de progresso e histórico dos usuários de forma persistente no Firebase Firestore. | 🔴 ALTA |
 
---

# 3.4 Restrições do Projeto

📌 **Restrições** são limitações externas impostas ao projeto.

Elas podem envolver:
- 📅 Prazo
- 🖥️ Tecnologia obrigatória ou proibida
- 🌐 Ambiente de execução
- 📜 Normas legais
- 🏢 Políticas institucionais

⚠️ Diferente dos RNFs, as restrições impõem **limites fixos** ao projeto.

---

## Tabela de Restrições

| ID | Restrição |
|----|-----------|
| R-01 | O projeto deverá ser entregue até o final do semestre letivo. |
| R-02 | O sistema deve ser desenvolvido como uma aplicação web, sem necessidade de instalação nativa. |
| R-03 | O sistema deve utilizar o Firebase (Authentication e Firestore) como backend e banco de dados. |
| R-04 | A geração de questões deve utilizar exclusivamente a API Gemini do Google. |
| R-05 | O sistema não deve armazenar senhas diretamente — a autenticação é delegada ao Firebase Authentication. |
| R-06 | O frontend deve ser desenvolvido com HTML, CSS e JavaScript puro (sem frameworks como React ou Vue). |
| R-07 | O sistema deve funcionar em navegadores modernos sem necessidade de plugins adicionais. |
| R-08 | O conteúdo gerado pela IA deve estar alinhado ao currículo da BNCC (Base Nacional Comum Curricular). |

---
## 3.5 Regras de Negócio

> Regras de Negócio definem as condições e políticas que o sistema deve seguir para garantir o correto funcionamento alinhado ao negócio.  
>  
> Elas indicam **quando** e **como** certas ações devem ocorrer, usando o padrão:  
>  
> **Se (condição) for verdadeira, então (ação) deve ser tomada.**  
>  
> Exemplo:  
> - "Um usuário só poderá finalizar um cadastro se todos os dados forem inseridos e validados com sucesso."  
>  
> Também pode ser escrito assim (if/then):  
> - "Se o usuário tem saldo acima de X, então a opção de empréstimo estará liberada."

---

 A tabela abaixo deve ser preenchida com as regras de negócio que **impactam seu projeto**. Os textos no quadro são apenas ilustrativos.

| ID | Regra de Negócio |
|----|-----------------|
| RN-01 | Um usuário só pode iniciar uma lição após estar autenticado; caso contrário, é redirecionado para a página de login. |
| RN-02 | Cada lição deve conter entre 1 e 10 questões, conforme escolha do usuário antes de iniciar. |
| RN-03 | O progresso percentual de uma matéria é calculado como: `(total de acertos nas lições concluídas / total de questões respondidas) × 100`. |
| RN-04 | Uma lição só é contabilizada no histórico e no ranking após ser marcada como concluída (todas as questões respondidas). |
| RN-05 | O XP do usuário no ranking é calculado com base no total de acertos de todas as lições concluídas em todas as matérias. |
| RN-06 | Se a IA (Gemini) falhar ou atingir o limite de requisições (erro 429), o sistema deve buscar automaticamente uma questão no banco de dados do Firestore, sem interromper a lição. |
| RN-07 | Questões geradas pela IA são automaticamente salvas no banco de questões do Firestore para uso futuro como fallback. |
| RN-08 | Tópicos concluídos continuam disponíveis para repetição; o botão "Iniciar" é substituído por "Repetir", mas a lição pode ser refeita normalmente. |
| RN-09 | O pódio do ranking exibe sempre 3 posições; caso não haja usuários suficientes, as posições vazias são preenchidas com "Ainda Vazio". |
| RN-10 | A pontuação de cada questão varia conforme a dificuldade: Fácil = 50 pts, Médio = 100 pts, Difícil = 150 pts. |

💡 **Dica:** Explique sempre o motivo ou impacto da regra no sistema.

---
> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)
