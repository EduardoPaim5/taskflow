-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para buscas fuzzy

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'TaskFlow database initialized successfully!';
END $$;
