FROM oven/bun

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY controller controller
COPY db db
COPY models models
COPY routes routes
COPY src src
COPY types types

COPY .env .env

COPY tsconfig.json .
# COPY public public

RUN mkdir public
RUN mkdir logs

CMD ["bun", "--hot", "src/app.ts"]

EXPOSE 8080