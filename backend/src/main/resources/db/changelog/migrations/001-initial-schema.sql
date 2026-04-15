--liquibase formatted sql

--changeset test:1
CREATE TABLE building_cases (
    id SERIAL PRIMARY KEY,
    objekta_adrese VARCHAR(255) NOT NULL,
    sienas_platums_mm INTEGER NOT NULL,
    sienas_augstums_mm INTEGER NOT NULL,
    bloka_augstums_mm INTEGER DEFAULT 200,
    bloka_garums_mm INTEGER DEFAULT 600,
    bloka_platums_mm INTEGER DEFAULT 300,
    bloka_suves_nobide_mm INTEGER DEFAULT 100,
    bloku_skaits INTEGER,
    pilnie_bloki INTEGER DEFAULT 0,
    sagrieztie_bloki INTEGER DEFAULT 0
);

--changeset test:2
CREATE TABLE windows (
    id SERIAL PRIMARY KEY,
    building_case_id INTEGER REFERENCES building_cases(id) ON DELETE CASCADE,
    width_mm INTEGER NOT NULL,
    height_mm INTEGER NOT NULL,
    x_mm INTEGER NOT NULL,
    y_mm INTEGER NOT NULL
);