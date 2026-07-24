FROM node:20-alpine
WORKDIR /repo

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps

RUN npm install

CMD ["npm", "run", "dev", "-w", "@sec1cng/worker"]
