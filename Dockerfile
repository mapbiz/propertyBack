FROM oven/bun

WORKDIR /app

COPY package.json .

RUN bun install

COPY src src
COPY tsconfig.json .
# COPY public public

ENV NODE_ENV production
CMD ["bun", "src/app.ts"]

EXPOSE 8080