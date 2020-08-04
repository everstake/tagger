FROM postgres:10
LABEL Name='solana-v0-db'

RUN set -eux ; \
    apt-get update -qq --assume-yes --fix-missing ; \
    apt-get install -qq --assume-yes curl wget apt-utils apt-transport-https ; \
    rm -rf /var/lib/apt/lists/*
