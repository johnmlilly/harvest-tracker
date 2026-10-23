-- 0001_init: initial schema (see PLAN.md). Dates stored as ISO text.

CREATE TABLE location (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  tz TEXT NOT NULL,
  nws_office TEXT,
  nws_grid_x INTEGER,
  nws_grid_y INTEGER,
  ncei_station_id TEXT
);

CREATE TABLE crop (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('field','vegetable')),
  nass_commodity TEXT,          -- null for snap beans
  gdd_base_f REAL,              -- nullable; corn commonly 50F base / 86F cap
  gdd_cap_f REAL,
  maturity_gdd INTEGER          -- nullable, varies by hybrid/variety
);

CREATE TABLE crop_stage (
  id INTEGER PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop(id),
  seq INTEGER NOT NULL,
  code TEXT,                    -- e.g. R6, R8
  name TEXT NOT NULL,
  description TEXT,
  typical_moisture_pct REAL,
  UNIQUE (crop_id, seq)
);

CREATE TABLE usual_dates (
  id INTEGER PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop(id),
  state TEXT NOT NULL,
  activity TEXT NOT NULL CHECK (activity IN ('plant','harvest')),
  begin_md TEXT,                -- 'MM-DD', repeats every year
  peak_start_md TEXT,
  peak_end_md TEXT,
  end_md TEXT,
  source TEXT NOT NULL,
  source_year INTEGER,
  UNIQUE (crop_id, state, activity, source)
);

CREATE TABLE crop_progress (
  id INTEGER PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop(id),
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  week_ending TEXT NOT NULL,
  stat TEXT NOT NULL,           -- planted | mature | harvested (extend via migration)
  pct REAL NOT NULL,
  fetched_at TEXT NOT NULL,
  UNIQUE (crop_id, state, week_ending, stat)   -- ingest upserts on this
);

CREATE TABLE frost_normal (
  id INTEGER PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES location(id),
  season TEXT NOT NULL CHECK (season IN ('spring','fall')),
  threshold_f INTEGER NOT NULL,   -- 36, 32, 28
  prob_pct INTEGER NOT NULL,
  date_md TEXT NOT NULL,
  normals_period TEXT NOT NULL,   -- '1991-2020'
  UNIQUE (location_id, season, threshold_f, prob_pct)
);

CREATE TABLE gdd_daily (
  location_id INTEGER NOT NULL REFERENCES location(id),
  date TEXT NOT NULL,
  tmax_f REAL NOT NULL,
  tmin_f REAL NOT NULL,
  gdd_f REAL NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (location_id, date)  -- also serves (location_id, date) reads
);

CREATE TABLE ingest_run (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,           -- running | ok | error
  rows_upserted INTEGER DEFAULT 0,
  error TEXT
);

CREATE TABLE raw_payload (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  request_key TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  body TEXT NOT NULL
);

-- Read paths
CREATE INDEX idx_crop_progress_lookup ON crop_progress (crop_id, state, week_ending);
CREATE INDEX idx_crop_progress_year ON crop_progress (crop_id, state, stat, year);
CREATE INDEX idx_ingest_run_source ON ingest_run (source, status, finished_at);
CREATE INDEX idx_raw_payload_fetched ON raw_payload (fetched_at);  -- 90-day prune
