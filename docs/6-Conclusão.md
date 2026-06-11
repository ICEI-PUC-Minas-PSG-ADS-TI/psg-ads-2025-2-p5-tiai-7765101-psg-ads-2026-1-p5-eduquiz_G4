# 6. Conclusão

---

## 6.1 Síntese dos Resultados

O EduQuiz foi desenvolvido com o objetivo de tornar o estudo autônomo mais acessível, dinâmico e motivador para estudantes brasileiros do Ensino Fundamental ao Ensino Médio e o software entregue cumpriu essa proposta de forma concreta.

A plataforma transformou o processo de revisão de conteúdo escolar, que antes dependia de apostilas, livros didáticos ou plataformas engessadas, em uma experiência gamificada e personalizada. Com a integração da **API Gemini do Google**, o sistema é capaz de gerar questões inéditas e contextualizadas a cada lição, cobrindo **12 disciplinas do currículo nacional** organizadas por nível escolar (Fundamental I, Fundamental II e Médio), todas alinhadas à **BNCC (Base Nacional Comum Curricular)**.

Os principais impactos positivos gerados pela solução foram:

- **Personalização real do aprendizado:** cada lição é gerada sob demanda pela IA, com dificuldade variável (Fácil, Médio, Difícil) e explicações detalhadas após cada resposta — algo que plataformas estáticas não oferecem.
- **Engajamento por gamificação:** o sistema de pontuação por questão (50/100/150 pts conforme a dificuldade), o ranking global com pódio e o histórico de progresso por matéria incentivam a continuidade nos estudos.
- **Rastreabilidade do aprendizado:** o histórico completo de lições permite que o estudante identifique suas dificuldades, revise questões anteriores e acompanhe sua evolução percentual por matéria.
- **Resiliência técnica:** o fallback automático para o banco de questões salvas no Firestore garante que o aprendizado não seja interrompido em caso de indisponibilidade da IA.

O projeto conecta-se diretamente com a **ODS 4 – Educação de Qualidade**, da ONU, ao democratizar o acesso a um conteúdo educacional de qualidade, gratuito e disponível em qualquer dispositivo com navegador — sem necessidade de instalação ou custo para o estudante.

---

## 6.2 Limitações e Trabalhos Futuros

Apesar dos resultados alcançados, o grupo reconhece limitações técnicas e de escopo que surgiram ao longo do desenvolvimento.

### Limitações atuais

| # | Limitação |
|---|-----------|
| 1 | Cota da API Gemini: o plano gratuito possui limite de requisições, o que pode acionar o fallback para o banco de questões com frequência em casos de uso intenso ou simultâneo. |
| 2 | Ausência de modo offline:a plataforma depende inteiramente de conexão com a internet, tanto para a IA quanto para o Firestore. |
| 3 | Responsividade parcial:algumas telas (histórico com modal de revisão, grade de matérias) não foram totalmente otimizadas para telas pequenas. |
| 4 | Idioma único: o sistema foi desenvolvido exclusivamente em português brasileiro, limitando o alcance para escolas bilíngues. |
| 5 | Sem perfil de professor ou controle parental: a plataforma atende apenas ao estudante individual, sem funcionalidades para acompanhamento de turmas. |

### Sugestões para a Versão 2.0

- Desenvolvimento de um **aplicativo mobile nativo** (React Native ou Flutter) com suporte a modo offline via cache local de questões.
- Implementação de um **painel do professor**, permitindo criar turmas, atribuir lições e visualizar o desempenho coletivo da turma.
- **Sistema de badges e conquistas**, recompensando sequências de estudo diárias, primeiros 100% em uma matéria e outras marcas relevantes.
- **Dificuldade adaptativa por IA:** calibração automática do nível das questões com base no histórico de desempenho do usuário.
- Integração com **Google Classroom ou plataformas LMS** para uso institucional em escolas.

---

## 6.3 Lições Aprendidas

Trabalhar como uma *Software House* real, entregando **Fatias Verticais** a cada Sprint, foi uma experiência significativamente diferente do modelo tradicional de desenvolvimento acadêmico. Em vez de dividir o projeto por camadas, cada integrante foi responsável por entregar funcionalidades completas — do banco de dados à interface — o que exigiu uma visão sistêmica do produto desde o início.

### Desafios técnicos e como foram superados

**Integração com a API Gemini**
O maior desafio técnico do projeto. O modelo nem sempre retornava JSON válido, o que exigiu a implementação de um parser robusto com fallback para o banco de questões do Firestore. A equipe aprendeu a lidar com respostas imprevisíveis de modelos de linguagem e a construir sistemas tolerantes a falhas.

**Modelagem do Firestore (NoSQL)**
A estrutura de subcoleções aninhadas (`usuarios/{uid}/materias/{materiaId}/licoes/{licaoId}/respostas`) apresentou curva de aprendizado para membros acostumados com bancos relacionais. Foi necessário pensar a modelagem com cuidado para evitar leituras desnecessárias e garantir eficiência na recuperação do histórico.

**Versionamento com Git em equipe**
Conflitos surgiram nas primeiras Sprints, especialmente em arquivos CSS e JavaScript compartilhados entre páginas. A adoção de convenções de branch por funcionalidade e a designação de um Tech Lead responsável pelos merges reduziu significativamente os conflitos nas Sprints seguintes.

**Autenticação e fluxo assíncrono**
A integração com Firebase Auth e o redirecionamento condicional entre páginas (usuário logado vs. não logado) trouxe aprendizados sobre programação assíncrona em JavaScript puro — sem frameworks que abstraem esses comportamentos.

### Conclusão geral

A metodologia de Fatias Verticais, apesar de desafiadora no início, resultou em um produto funcional e coeso desde a Sprint 2, com entregas visíveis e testáveis a cada ciclo. Isso manteve a equipe alinhada com os objetivos do produto e motivada para as entregas seguintes — simulando de forma fiel o ambiente de uma *Software House* profissional.
