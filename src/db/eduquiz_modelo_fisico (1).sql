-- ============================================================
-- EduQuiz - Modelo Fisico de Dados (Script SQL)
-- Banco de Dados: MySQL 8.0+
-- Projeto: EduQuiz - PUC Minas PSG ADS 2026/1
-- Sprint 3 - Core
-- ============================================================

-- Remove as tabelas na ordem correta (respeita FKs)
DROP TABLE IF EXISTS respostas;
DROP TABLE IF EXISTS tentativas;
DROP TABLE IF EXISTS alternativas;
DROP TABLE IF EXISTS perguntas;
DROP TABLE IF EXISTS progresso;
DROP TABLE IF EXISTS ranking;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS materias;
DROP TABLE IF EXISTS usuarios;

-- ============================================================
-- 1. TABELA: USUARIOS
-- Armazena os dados de cadastro e autenticacao dos usuarios
-- ============================================================
CREATE TABLE usuarios (
    id_usuario    VARCHAR(36)   PRIMARY KEY,
    nome          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    senha_hash    VARCHAR(255)  NOT NULL,
    tipo          ENUM('aluno', 'professor', 'admin') NOT NULL DEFAULT 'aluno',
    foto_url      VARCHAR(500)  DEFAULT NULL,
    data_cadastro TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP     DEFAULT NULL,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 2. TABELA: MATERIAS
-- Catalogo de materias/disciplinas disponiveis no sistema
-- ============================================================
CREATE TABLE materias (
    id_materia  INT           AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(80)   NOT NULL UNIQUE,
    descricao   VARCHAR(255)  DEFAULT NULL,
    icone_url   VARCHAR(500)  DEFAULT NULL,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 3. TABELA: QUIZZES
-- Registra cada quiz criado, vinculado a uma materia e criador
-- ============================================================
CREATE TABLE quizzes (
    id_quiz       VARCHAR(36)   PRIMARY KEY,
    id_materia    INT           NOT NULL,
    id_criador    VARCHAR(36)   NOT NULL,
    titulo        VARCHAR(150)  NOT NULL,
    descricao     VARCHAR(500)  DEFAULT NULL,
    dificuldade   ENUM('facil', 'medio', 'dificil') NOT NULL DEFAULT 'medio',
    tempo_limite  INT           DEFAULT NULL COMMENT 'Tempo limite em segundos',
    qtd_perguntas INT           NOT NULL DEFAULT 0,
    data_criacao  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_quiz_materia FOREIGN KEY (id_materia) REFERENCES materias(id_materia),
    CONSTRAINT fk_quiz_criador FOREIGN KEY (id_criador) REFERENCES usuarios(id_usuario)
);

-- ============================================================
-- 4. TABELA: PERGUNTAS
-- Cada pergunta pertence a um quiz especifico
-- ============================================================
CREATE TABLE perguntas (
    id_pergunta    VARCHAR(36)   PRIMARY KEY,
    id_quiz        VARCHAR(36)   NOT NULL,
    enunciado      TEXT          NOT NULL,
    tipo           ENUM('multipla_escolha', 'verdadeiro_falso') NOT NULL DEFAULT 'multipla_escolha',
    dificuldade    ENUM('facil', 'medio', 'dificil') NOT NULL DEFAULT 'medio',
    pontos         INT           NOT NULL DEFAULT 10,
    gerada_por_ia  BOOLEAN       NOT NULL DEFAULT FALSE COMMENT 'Indica se foi gerada pela Gemini AI',
    ordem          INT           NOT NULL DEFAULT 0,

    CONSTRAINT fk_pergunta_quiz FOREIGN KEY (id_quiz) REFERENCES quizzes(id_quiz) ON DELETE CASCADE
);

-- ============================================================
-- 5. TABELA: ALTERNATIVAS
-- Opcoes de resposta para cada pergunta
-- ============================================================
CREATE TABLE alternativas (
    id_alternativa VARCHAR(36)   PRIMARY KEY,
    id_pergunta    VARCHAR(36)   NOT NULL,
    texto          VARCHAR(500)  NOT NULL,
    correta        BOOLEAN       NOT NULL DEFAULT FALSE,
    ordem          INT           NOT NULL DEFAULT 0,

    CONSTRAINT fk_alternativa_pergunta FOREIGN KEY (id_pergunta) REFERENCES perguntas(id_pergunta) ON DELETE CASCADE
);

-- ============================================================
-- 6. TABELA: TENTATIVAS
-- Cada sessao de quiz realizada por um usuario
-- ============================================================
CREATE TABLE tentativas (
    id_tentativa    VARCHAR(36)   PRIMARY KEY,
    id_usuario      VARCHAR(36)   NOT NULL,
    id_quiz         VARCHAR(36)   NOT NULL,
    pontuacao       INT           NOT NULL DEFAULT 0,
    acertos         INT           NOT NULL DEFAULT 0,
    erros           INT           NOT NULL DEFAULT 0,
    tempo_gasto_seg INT           DEFAULT NULL COMMENT 'Tempo total em segundos',
    data_realizacao TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finalizada      BOOLEAN       NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_tentativa_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_tentativa_quiz    FOREIGN KEY (id_quiz)    REFERENCES quizzes(id_quiz)
);

-- ============================================================
-- 7. TABELA: RESPOSTAS
-- Registro individual de cada resposta dada pelo usuario
-- ============================================================
CREATE TABLE respostas (
    id_resposta        VARCHAR(36)   PRIMARY KEY,
    id_tentativa       VARCHAR(36)   NOT NULL,
    id_pergunta        VARCHAR(36)   NOT NULL,
    id_alternativa     VARCHAR(36)   NOT NULL,
    correta            BOOLEAN       NOT NULL DEFAULT FALSE,
    tempo_resposta_seg INT           DEFAULT NULL COMMENT 'Tempo de resposta em segundos',

    CONSTRAINT fk_resposta_tentativa   FOREIGN KEY (id_tentativa)   REFERENCES tentativas(id_tentativa) ON DELETE CASCADE,
    CONSTRAINT fk_resposta_pergunta    FOREIGN KEY (id_pergunta)    REFERENCES perguntas(id_pergunta),
    CONSTRAINT fk_resposta_alternativa FOREIGN KEY (id_alternativa) REFERENCES alternativas(id_alternativa)
);

-- ============================================================
-- 8. TABELA: RANKING
-- Classificacao geral dos usuarios (atualizada periodicamente)
-- ============================================================
CREATE TABLE ranking (
    id_ranking          VARCHAR(36)   PRIMARY KEY,
    id_usuario          VARCHAR(36)   NOT NULL UNIQUE,
    pontuacao_total     INT           NOT NULL DEFAULT 0,
    quizzes_completados INT           NOT NULL DEFAULT 0,
    acertos_total       INT           NOT NULL DEFAULT 0,
    tempo_total_seg     INT           NOT NULL DEFAULT 0,
    posicao             INT           DEFAULT NULL,
    atualizado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ranking_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- ============================================================
-- 9. TABELA: PROGRESSO
-- Acompanhamento do progresso do usuario por materia
-- ============================================================
CREATE TABLE progresso (
    id_progresso   VARCHAR(36)    PRIMARY KEY,
    id_usuario     VARCHAR(36)    NOT NULL,
    id_materia     INT            NOT NULL,
    quizzes_feitos INT            NOT NULL DEFAULT 0,
    media_acertos  DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    nivel_atual    ENUM('iniciante', 'intermediario', 'avancado', 'expert') NOT NULL DEFAULT 'iniciante',
    xp_acumulado   INT            NOT NULL DEFAULT 0,
    atualizado_em  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_progresso_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_progresso_materia FOREIGN KEY (id_materia) REFERENCES materias(id_materia),
    CONSTRAINT uq_progresso_usuario_materia UNIQUE (id_usuario, id_materia)
);

-- ============================================================
-- INDICES para otimizacao de consultas
-- ============================================================
CREATE INDEX idx_usuarios_email        ON usuarios(email);
CREATE INDEX idx_quizzes_materia       ON quizzes(id_materia);
CREATE INDEX idx_quizzes_criador       ON quizzes(id_criador);
CREATE INDEX idx_perguntas_quiz        ON perguntas(id_quiz);
CREATE INDEX idx_alternativas_pergunta ON alternativas(id_pergunta);
CREATE INDEX idx_tentativas_usuario    ON tentativas(id_usuario);
CREATE INDEX idx_tentativas_quiz       ON tentativas(id_quiz);
CREATE INDEX idx_respostas_tentativa   ON respostas(id_tentativa);
CREATE INDEX idx_ranking_pontuacao     ON ranking(pontuacao_total DESC);
CREATE INDEX idx_progresso_usuario     ON progresso(id_usuario);

-- ============================================================
-- DADOS INICIAIS (Seed)
-- ============================================================
INSERT INTO materias (nome, descricao) VALUES
    ('Matematica',  'Algebra, Geometria, Aritmetica e Estatistica'),
    ('Portugues',   'Gramatica, Interpretacao de Texto e Redacao'),
    ('Historia',    'Historia do Brasil e Historia Geral'),
    ('Geografia',   'Geografia Fisica e Humana'),
    ('Ciencias',    'Biologia, Quimica e Fisica'),
    ('Ingles',      'Vocabulario, Gramatica e Interpretacao'),
    ('Tecnologia',  'Informatica, Programacao e Logica');
