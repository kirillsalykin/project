CREATE TABLE session (
    token UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
