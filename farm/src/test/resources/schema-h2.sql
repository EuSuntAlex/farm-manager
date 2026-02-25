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
                                           day_of_month                INTEGER NOT NULL,
                                           month_of_year               INTEGER NOT NULL,
                                           year_value                  INTEGER NOT NULL,
                                           user_id                     INTEGER NOT NULL,

                                           CONSTRAINT check_month CHECK (month_of_year >= 1 AND month_of_year <= 12),
                                           CONSTRAINT check_day CHECK (day_of_month >= 1 AND day_of_month <= 31),
                                           CONSTRAINT check_year CHECK (year_value >= 2000),
                                           CONSTRAINT check_nr_animale CHECK (nr_animale >= 0),
                                           CONSTRAINT check_mulsoare1 CHECK (mulsoare1 >= 0),
                                           CONSTRAINT check_mulsoare2 CHECK (mulsoare2 >= 0),
                                           CONSTRAINT check_valoare_predata CHECK (valoare_predata >= 0),
                                           CONSTRAINT check_lapte_vitei CHECK (lapte_vitei >= 0),
                                           CONSTRAINT check_vanzare_externa CHECK (vanzare_externa >= 0),

                                           CONSTRAINT unique_jurnal_per_day
                                               UNIQUE (day_of_month, month_of_year, year_value, user_id)
);