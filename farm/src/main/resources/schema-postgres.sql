CREATE SCHEMA IF NOT EXISTS pages;

CREATE TABLE IF NOT EXISTS pages.jurnal(
                                           jurnalId                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                           nr_animale                  INTEGER NOT NULL DEFAULT 0,
                                           mulsoare1                   INTEGER NOT NULL DEFAULT 0,
                                           mulsoare2                   INTEGER NOT NULL DEFAULT 0,
                                           valoare_predata             INTEGER NOT NULL DEFAULT 0,
                                           destinatar                  VARCHAR(255) NOT NULL,
                                           lapte_vitei                 INTEGER NOT NULL DEFAULT 0,
                                           vanzare_externa             INTEGER NOT NULL DEFAULT 0,
                                           vanzare_externa_destinatar  VARCHAR(255) DEFAULT '',
                                           day                         INTEGER NOT NULL,
                                           month                       INTEGER NOT NULL,
                                           year                        INTEGER NOT NULL,
                                           user_id                     INTEGER NOT NULL,

    -- Constrângeri de validare
                                           CONSTRAINT check_month CHECK (month >= 1 AND month <= 12),
                                           CONSTRAINT check_day CHECK (day >= 1 AND day <= 31),
                                           CONSTRAINT check_year CHECK (year >= 2000),
                                           CONSTRAINT check_nr_animale CHECK (nr_animale >= 0),
                                           CONSTRAINT check_mulsoare1 CHECK (mulsoare1 >= 0),
                                           CONSTRAINT check_mulsoare2 CHECK (mulsoare2 >= 0),
                                           CONSTRAINT check_valoare_predata CHECK (valoare_predata >= 0),
                                           CONSTRAINT check_lapte_vitei CHECK (lapte_vitei >= 0),
                                           CONSTRAINT check_vanzare_externa CHECK (vanzare_externa >= 0),

    -- Unicitate pentru o singură înregistrare pe zi per user
                                           CONSTRAINT unique_jurnal_per_day UNIQUE (day, month, year, user_id)
);

-- Index pentru căutări rapide după dată și user
--CREATE INDEX IF NOT EXISTS idx_jurnal_data_user ON pages.jurnal(year, month, day, user_id);

-- Index pentru căutări după user
--CREATE INDEX IF NOT EXISTS idx_jurnal_user ON pages.jurnal(user_id);


-- Comentarii pentru documentare
COMMENT ON TABLE pages.jurnal IS 'Jurnal zilnic pentru gestionarea producției de lapte';
COMMENT ON COLUMN pages.jurnal.nr_animale IS 'Numărul de animale mulse';
COMMENT ON COLUMN pages.jurnal.mulsoare1 IS 'Cantitatea de lapte - mulsoarea 1';
COMMENT ON COLUMN pages.jurnal.mulsoare2 IS 'Cantitatea de lapte - mulsoarea 2';
COMMENT ON COLUMN pages.jurnal.valoare_predata IS 'Valoarea laptelui predat';
COMMENT ON COLUMN pages.jurnal.destinatar IS 'Destinatarul principal al laptelui';
COMMENT ON COLUMN pages.jurnal.lapte_vitei IS 'Cantitatea de lapte pentru viței';
COMMENT ON COLUMN pages.jurnal.vanzare_externa IS 'Cantitatea vândută extern';
COMMENT ON COLUMN pages.jurnal.vanzare_externa_destinatar IS 'Destinatarul vânzării externe';
COMMENT ON COLUMN pages.jurnal.day IS 'Ziua lunii';
COMMENT ON COLUMN pages.jurnal.month IS 'Luna anului';
COMMENT ON COLUMN pages.jurnal.year IS 'Anul';
COMMENT ON COLUMN pages.jurnal.user_id IS 'ID-ul utilizatorului care a creat înregistrarea';




-- Tabel tipuri magazie
CREATE TABLE IF NOT EXISTS pages.tip_magazie(
                                                id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                                cod                VARCHAR(50) NOT NULL,
                                                denumire           VARCHAR(255) NOT NULL,
                                                unitate_masura     VARCHAR(50) NOT NULL,
                                                user_id            INTEGER NOT NULL,

                                                CONSTRAINT unique_tip_per_user UNIQUE (cod, user_id)
);

-- Tabel mișcări magazie (fără nrDocument)
CREATE TABLE IF NOT EXISTS pages.magazie(
                                            id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                            tip_magazie_id     BIGINT NOT NULL,
                                            user_id            INTEGER NOT NULL,
                                            furnizor           VARCHAR(255),                    -- OPȚIONAL
                                            day                INTEGER NOT NULL,
                                            month              INTEGER NOT NULL,
                                            year               INTEGER NOT NULL,
                                            intrari            DECIMAL(10,2) DEFAULT 0,
                                            iesiri             DECIMAL(10,2) DEFAULT 0,
                                            stoc_final         DECIMAL(10,2) NOT NULL,

                                            CONSTRAINT fk_tip_magazie
                                                FOREIGN KEY (tip_magazie_id)
                                                    REFERENCES pages.tip_magazie(id)
                                                    ON DELETE RESTRICT,

                                            CONSTRAINT check_intrari CHECK (intrari >= 0),
                                            CONSTRAINT check_iesiri CHECK (iesiri >= 0),
                                            CONSTRAINT check_stoc_final CHECK (stoc_final >= 0)
);

-- Index-uri
--CREATE INDEX IF NOT EXISTS idx_miscari_tip ON pages.magazie(tip_magazie_id);
--CREATE INDEX IF NOT EXISTS idx_miscari_data ON pages.magazie(year, month, day);
--CREATE INDEX IF NOT EXISTS idx_miscari_user ON pages.magazie(user_id);

-- Creează tabela cu nume de coloane standard (snake_case)
CREATE TABLE IF NOT EXISTS pages.centralizator (
                                                   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                                   tip_magazie_id BIGINT NOT NULL,               -- FK către tip_magazie
                                                   stoc_initial INTEGER NOT NULL DEFAULT 0,
                                                   intrari INTEGER NOT NULL DEFAULT 0,
                                                   vaci_lapte INTEGER NOT NULL DEFAULT 0,
                                                   vaci_gestante INTEGER NOT NULL DEFAULT 0,
                                                   junici_gestante INTEGER NOT NULL DEFAULT 0,
                                                   alte_vaci INTEGER NOT NULL DEFAULT 0,
                                                   vitele_montate INTEGER NOT NULL DEFAULT 0,
                                                   junici INTEGER NOT NULL DEFAULT 0,
                                                   vitele_6_12_luni INTEGER NOT NULL DEFAULT 0,
                                                   vitele_3_6_luni INTEGER NOT NULL DEFAULT 0,
                                                   vitele_0_3_luni INTEGER NOT NULL DEFAULT 0,
                                                   taurasi INTEGER NOT NULL DEFAULT 0,
                                                   observatii TEXT,
                                                   user_id INTEGER NOT NULL,
                                                   month INTEGER NOT NULL,
                                                   year INTEGER NOT NULL,
                                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- unicitate: o singură intrare pe tip/lună/user
                                                   CONSTRAINT unique_tip_luna UNIQUE (user_id, tip_magazie_id, year, month),

    -- FK
                                                   CONSTRAINT fk_tip_magazie
                                                       FOREIGN KEY (tip_magazie_id)
                                                           REFERENCES pages.tip_magazie(id)
                                                           ON DELETE CASCADE,

    -- validări
                                                   CONSTRAINT valid_month CHECK (month >= 1 AND month <= 12),
                                                   CONSTRAINT valid_year CHECK (year >= 2000)
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_centralizator_user ON pages.centralizator(user_id);
CREATE INDEX IF NOT EXISTS idx_centralizator_tip ON pages.centralizator(tip_magazie_id);
CREATE INDEX IF NOT EXISTS idx_centralizator_data ON pages.centralizator(year, month);
CREATE INDEX IF NOT EXISTS idx_centralizator_user_data ON pages.centralizator(user_id, year, month);


CREATE TABLE IF NOT EXISTS pages.tipeveniment (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  nume VARCHAR(255) NOT NULL,
                                                  duration INTEGER NOT NULL,
                                                  user_id INTEGER NOT NULL
);

-- Tabela pentru evenimente
CREATE TABLE IF NOT EXISTS pages.eveniment (
                                               id BIGSERIAL PRIMARY KEY,
                                               tip_eveniment_id INTEGER NOT NULL,
                                               title VARCHAR(255) NOT NULL,
                                               date_start TIMESTAMP NOT NULL,
                                               date_end TIMESTAMP,
                                               user_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pages.ingredient (
                                                id BIGSERIAL PRIMARY KEY,
                                                name VARCHAR(255) NOT NULL,
                                                unitate_masura VARCHAR(50) NOT NULL,
                                                price INTEGER NOT NULL,
                                                user_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pages.reteta (
                                            id BIGSERIAL PRIMARY KEY,
                                            nume VARCHAR(255) NOT NULL,
                                            descriere TEXT,
                                            data_creare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                            user_id INTEGER NOT NULL
);

-- =============================================
-- TABEL: reteta_ingredient (legătură între rețete și ingrediente)
-- =============================================
CREATE TABLE IF NOT EXISTS pages.reteta_ingredient (
                                                       id BIGSERIAL PRIMARY KEY,
                                                       reteta_id INTEGER NOT NULL,
                                                       ingredient_id INTEGER NOT NULL,
                                                       cantitate DECIMAL(10, 2) NOT NULL,

    -- Constraint pentru chei străine
                                                       CONSTRAINT fk_reteta_ingredient_reteta
                                                           FOREIGN KEY (reteta_id)
                                                               REFERENCES pages.reteta(id)
                                                               ON DELETE CASCADE,

                                                       CONSTRAINT fk_reteta_ingredient_ingredient
                                                           FOREIGN KEY (ingredient_id)
                                                               REFERENCES pages.ingredient(id)
                                                               ON DELETE CASCADE,

    -- Un ingredient nu poate apărea de două ori în aceeași rețetă
                                                       CONSTRAINT unique_reteta_ingredient
                                                           UNIQUE(reteta_id, ingredient_id)
);

-- Tabela pentru rase (tipBovina)
CREATE TABLE IF NOT EXISTS pages.tipbovina (
                                               id BIGSERIAL PRIMARY KEY,
                                               name VARCHAR(255) NOT NULL,
                                               default_reteta_id INTEGER,
                                               user_id INTEGER NOT NULL
);

-- Tabela pentru bovine
CREATE TABLE IF NOT EXISTS pages.bovina (
                                            id BIGSERIAL PRIMARY KEY,
                                            user_id INTEGER NOT NULL,
                                            date_birth DATE NOT NULL,
                                            is_male BOOLEAN NOT NULL,
                                            nr_fatari INTEGER DEFAULT 0,
                                            productie_lapte INTEGER,
                                            nota TEXT,
                                            location VARCHAR(255),
                                            is_observed BOOLEAN DEFAULT FALSE,
                                            reteta_id INTEGER,
                                            tip_bovina_id INTEGER NOT NULL
);

-- Indexi pentru performanță
CREATE INDEX IF NOT EXISTS idx_tipbovina_user_id ON pages.tipbovina(user_id);
CREATE INDEX IF NOT EXISTS idx_tipbovina_name ON pages.tipbovina(name);

CREATE INDEX IF NOT EXISTS idx_bovina_user_id ON pages.bovina(user_id);
CREATE INDEX IF NOT EXISTS idx_bovina_tip_bovina_id ON pages.bovina(tip_bovina_id);
CREATE INDEX IF NOT EXISTS idx_bovina_reteta_id ON pages.bovina(reteta_id);
CREATE INDEX IF NOT EXISTS idx_bovina_is_male ON pages.bovina(is_male);

-- Modifică tabela eveniment să includă bovina_id (dacă nu ai făcut-o deja)
ALTER TABLE pages.eveniment ADD COLUMN IF NOT EXISTS bovina_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_eveniment_bovina_id ON pages.eveniment(bovina_id);
ALTER TABLE pages.bovina
    ADD COLUMN IF NOT EXISTS greutate DOUBLE PRECISION;

-- Tabela pentru istoricul greutăților
CREATE TABLE IF NOT EXISTS pages.bovina_greutate_istorice (
                                                              id BIGSERIAL PRIMARY KEY,
                                                              bovina_id INTEGER NOT NULL,
                                                              greutate DOUBLE PRECISION NOT NULL,
                                                              data_masuratoare DATE NOT NULL,
                                                              nota TEXT,
                                                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                                              CONSTRAINT fk_bovina_greutate_bovina
                                                                  FOREIGN KEY (bovina_id)
                                                                      REFERENCES pages.bovina(id)
                                                                      ON DELETE CASCADE
);

-- Indexi pentru performanță
CREATE INDEX IF NOT EXISTS idx_bovina_user_id ON pages.bovina(user_id);
CREATE INDEX IF NOT EXISTS idx_bovina_tip_bovina_id ON pages.bovina(tip_bovina_id);
CREATE INDEX IF NOT EXISTS idx_bovina_reteta_id ON pages.bovina(reteta_id);

CREATE INDEX IF NOT EXISTS idx_bovina_greutate_bovina_id
    ON pages.bovina_greutate_istorice(bovina_id);
CREATE INDEX IF NOT EXISTS idx_bovina_greutate_data
    ON pages.bovina_greutate_istorice(data_masuratoare);

-- Indexi pentru tipbovina (din modelul tău)
CREATE INDEX IF NOT EXISTS idx_tipbovina_user_id ON pages.tipbovina(user_id);
CREATE INDEX IF NOT EXISTS idx_tipbovina_name ON pages.tipbovina(name);

