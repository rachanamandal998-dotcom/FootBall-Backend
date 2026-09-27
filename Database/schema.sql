CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'manager',
  username VARCHAR(255) NULL,
  display_name VARCHAR(255) NULL,
  photo VARCHAR(2048) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stadiums (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NULL,
  capacity INT NULL,
  image VARCHAR(2048) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  logo VARCHAR(2048) NULL,
  location VARCHAR(255) NULL,
  stadium VARCHAR(255) NULL,
  stadium_id VARCHAR(64) NULL,
  coach VARCHAR(255) NULL,
  manager VARCHAR(255) NULL,
  founded INT NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(50) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  colors JSON NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_teams_stadium (stadium_id),
  CONSTRAINT fk_teams_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(64) PRIMARY KEY,
  photo VARCHAR(2048) NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NULL,
  display_name VARCHAR(255) NULL,
  name VARCHAR(255) NULL,
  dob VARCHAR(32) NULL,
  nationality VARCHAR(100) NULL,
  country_of_birth VARCHAR(100) NULL,
  height INT NULL,
  weight INT NULL,
  preferred_foot VARCHAR(20) NULL,
  position VARCHAR(100) NOT NULL,
  secondary_position VARCHAR(100) NULL,
  jersey INT NULL,
  team_id VARCHAR(64) NOT NULL,
  squad VARCHAR(100) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  date_joined VARCHAR(32) NULL,
  contract_start VARCHAR(32) NULL,
  contract_end VARCHAR(32) NULL,
  contract_status VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_players_team (team_id),
  KEY idx_players_position (position),
  CONSTRAINT fk_players_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS competitions (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NULL,
  logo VARCHAR(2048) NULL,
  season VARCHAR(32) NULL,
  type VARCHAR(50) NULL,
  description TEXT NULL,
  points_win INT NOT NULL DEFAULT 3,
  points_draw INT NOT NULL DEFAULT 1,
  points_loss INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS competition_teams (
  competition_id VARCHAR(64) NOT NULL,
  team_id VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (competition_id, team_id),
  KEY idx_comp_teams_team (team_id),
  CONSTRAINT fk_comp_teams_comp FOREIGN KEY (competition_id) REFERENCES competitions (id) ON DELETE CASCADE,
  CONSTRAINT fk_comp_teams_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(64) PRIMARY KEY,
  comp_id VARCHAR(64) NOT NULL,
  season VARCHAR(32) NULL,
  home_team_id VARCHAR(64) NOT NULL,
  away_team_id VARCHAR(64) NOT NULL,
  match_date VARCHAR(32) NOT NULL,
  match_time VARCHAR(16) NULL,
  stadium VARCHAR(255) NULL,
  stadium_id VARCHAR(64) NULL,
  referee VARCHAR(255) NULL,
  assistant_referee1 VARCHAR(255) NULL,
  assistant_referee2 VARCHAR(255) NULL,
  var_official VARCHAR(255) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  possession_home INT NOT NULL DEFAULT 50,
  possession_away INT NOT NULL DEFAULT 50,
  shots_home INT NOT NULL DEFAULT 0,
  shots_away INT NOT NULL DEFAULT 0,
  shots_on_target_home INT NOT NULL DEFAULT 0,
  shots_on_target_away INT NOT NULL DEFAULT 0,
  corners_home INT NOT NULL DEFAULT 0,
  corners_away INT NOT NULL DEFAULT 0,
  fouls_home INT NOT NULL DEFAULT 0,
  fouls_away INT NOT NULL DEFAULT 0,
  offsides_home INT NOT NULL DEFAULT 0,
  offsides_away INT NOT NULL DEFAULT 0,
  pass_accuracy_home INT NOT NULL DEFAULT 0,
  pass_accuracy_away INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_matches_comp (comp_id),
  KEY idx_matches_home (home_team_id),
  KEY idx_matches_away (away_team_id),
  KEY idx_matches_status (status),
  KEY idx_matches_date (match_date),
  CONSTRAINT fk_matches_comp FOREIGN KEY (comp_id) REFERENCES competitions (id) ON DELETE RESTRICT,
  CONSTRAINT fk_matches_home FOREIGN KEY (home_team_id) REFERENCES teams (id) ON DELETE RESTRICT,
  CONSTRAINT fk_matches_away FOREIGN KEY (away_team_id) REFERENCES teams (id) ON DELETE RESTRICT,
  CONSTRAINT fk_matches_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS match_events (
  id VARCHAR(64) PRIMARY KEY,
  match_id VARCHAR(64) NOT NULL,
  minute INT NOT NULL,
  extra INT NOT NULL DEFAULT 0,
  type VARCHAR(20) NOT NULL,
  team_id VARCHAR(64) NULL,
  player_id VARCHAR(64) NULL,
  scorer_id VARCHAR(64) NULL,
  assist_id VARCHAR(64) NULL,
  player_off_id VARCHAR(64) NULL,
  player_on_id VARCHAR(64) NULL,
  goal_type VARCHAR(50) NULL,
  reason VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  KEY idx_events_match (match_id),
  KEY idx_events_player (player_id),
  CONSTRAINT fk_events_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
  CONSTRAINT fk_events_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_scorer FOREIGN KEY (scorer_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_assist FOREIGN KEY (assist_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_off FOREIGN KEY (player_off_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_on FOREIGN KEY (player_on_id) REFERENCES players (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS match_lineups (
  match_id VARCHAR(64) NOT NULL,
  side VARCHAR(10) NOT NULL,
  formation VARCHAR(20) NULL,
  positions JSON NULL,
  PRIMARY KEY (match_id, side),
  CONSTRAINT fk_lineups_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lineup_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id VARCHAR(64) NOT NULL,
  side VARCHAR(10) NOT NULL,
  player_id VARCHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  KEY idx_lineup_players_match (match_id),
  KEY idx_lineup_players_player (player_id),
  CONSTRAINT fk_lineup_players_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
  CONSTRAINT fk_lineup_players_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(2048) NULL,
  content MEDIUMTEXT NOT NULL,
  excerpt TEXT NULL,
  author VARCHAR(255) NULL,
  category VARCHAR(50) NULL,
  news_date VARCHAR(32) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_news_status (status),
  KEY idx_news_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS injuries (
  id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL,
  type VARCHAR(255) NOT NULL,
  injury_date VARCHAR(32) NULL,
  expected_return VARCHAR(32) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Injured',
  medical_notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_injuries_player (player_id),
  KEY idx_injuries_status (status),
  CONSTRAINT fk_injuries_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_sessions (
  id VARCHAR(64) PRIMARY KEY,
  session_date VARCHAR(32) NOT NULL,
  session_time VARCHAR(16) NULL,
  type VARCHAR(50) NULL,
  duration INT NULL,
  coach VARCHAR(255) NULL,
  team_id VARCHAR(64) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_training_team (team_id),
  CONSTRAINT fk_training_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_attendance (
  training_id VARCHAR(64) NOT NULL,
  player_id VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Present',
  PRIMARY KEY (training_id, player_id),
  KEY idx_attendance_player (player_id),
  CONSTRAINT fk_attendance_training FOREIGN KEY (training_id) REFERENCES training_sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo VARCHAR(2048) NULL,
  role VARCHAR(100) NULL,
  nationality VARCHAR(100) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  team_id VARCHAR(64) NULL,
  join_date VARCHAR(32) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_staff_team (team_id),
  CONSTRAINT fk_staff_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transfers (
  id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL,
  previous_team_id VARCHAR(64) NULL,
  new_team_id VARCHAR(64) NULL,
  type VARCHAR(50) NULL,
  transfer_date VARCHAR(32) NULL,
  fee VARCHAR(100) NULL,
  contract_expiry VARCHAR(32) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_transfers_player (player_id),
  KEY idx_transfers_new_team (new_team_id),
  CONSTRAINT fk_transfers_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
  CONSTRAINT fk_transfers_prev_team FOREIGN KEY (previous_team_id) REFERENCES teams (id) ON DELETE SET NULL,
  CONSTRAINT fk_transfers_new_team FOREIGN KEY (new_team_id) REFERENCES teams (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contracts (
  id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL,
  team_id VARCHAR(64) NULL,
  start_date VARCHAR(32) NOT NULL,
  end_date VARCHAR(32) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_contracts_player (player_id),
  KEY idx_contracts_team (team_id),
  CONSTRAINT fk_contracts_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General Contact',
  status VARCHAR(50) NOT NULL DEFAULT 'New',
  manager_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  KEY idx_reports_status (status),
  KEY idx_reports_category (category),
  KEY idx_reports_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message VARCHAR(500) NULL,
  type VARCHAR(50) NULL,
  actor VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_activities_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(64) PRIMARY KEY,
  setting_key VARCHAR(64) NOT NULL,
  club_name VARCHAR(255) NULL,
  tagline VARCHAR(255) NULL,
  hero_text TEXT NULL,
  about_text TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
