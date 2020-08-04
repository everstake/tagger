FROM node:10-slim
LABEL Name='solana-v0-counter-service' Version=1.0

WORKDIR /service/

EXPOSE 3030

CMD yarn install --production --frozen-lockfile && NODE_ENV=production yarn migrate && yarn start-prod

#CMD tail -f /dev/null
