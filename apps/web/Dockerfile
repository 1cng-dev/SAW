FROM node:20-alpine
WORKDIR /repo

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps

RUN npm install

EXPOSE 5173
CMD ["npm", "run", "dev", "-w", "@sec1cng/web", "--", "--host"]
