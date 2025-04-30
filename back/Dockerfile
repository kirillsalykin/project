# syntax=docker/dockerfile:1.4

FROM rust:1.86-slim AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    cargo fetch

COPY . .

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    cargo build --release \
    && cp /app/target/release/project /app/project

FROM gcr.io/distroless/cc-debian12

WORKDIR /app

COPY --from=builder /app/project .

CMD ["./project"]
