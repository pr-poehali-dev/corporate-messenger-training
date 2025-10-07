-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы учебных групп
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admin_id INTEGER REFERENCES users(id),
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_closed BOOLEAN DEFAULT FALSE
);

-- Создание таблицы участников групп
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    file_name VARCHAR(255),
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы должников
CREATE TABLE IF NOT EXISTS debtors (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    UNIQUE(group_id, user_id)
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_debtors_group ON debtors(group_id);
CREATE INDEX IF NOT EXISTS idx_debtors_resolved ON debtors(resolved);