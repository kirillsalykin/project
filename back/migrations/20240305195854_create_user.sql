CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE "user" (
   id UUID PRIMARY KEY,
   email CITEXT NOT NULL UNIQUE CHECK (length(email) <= 320),
   hashed_password TEXT NOT NULL,
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now()
);
