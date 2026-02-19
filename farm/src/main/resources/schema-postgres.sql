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