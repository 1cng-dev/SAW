FROM node:20-alpine
WORKDIR /repo

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages

RUN npm install

WORKDIR /repo/packages/db
CMD ["npx", "tsx", "src/migrate.ts"]
