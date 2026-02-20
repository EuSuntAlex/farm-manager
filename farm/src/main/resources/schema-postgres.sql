CREATE SCHEMA IF NOT EXISTS pages;

CREATE TABLE IF NOT EXISTS pages.jurnal(
                                           id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
                                           CONSTRAINT check_year CHECK (year >= 2020),
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
CREATE INDEX IF NOT EXISTS idx_jurnal_data_user ON pages.jurnal(year, month, day, user_id);

-- Index pentru căutări după user
CREATE INDEX IF NOT EXISTS idx_jurnal_user ON pages.jurnal(user_id);


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
CREATE INDEX IF NOT EXISTS idx_miscari_tip ON pages.magazie(tip_magazie_id);
CREATE INDEX IF NOT EXISTS idx_miscari_data ON pages.magazie(year, month, day);
CREATE INDEX IF NOT EXISTS idx_miscari_user ON pages.magazie(user_id);