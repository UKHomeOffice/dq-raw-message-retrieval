FROM node:9-alpine as builder
COPY package* ./
RUN npm i
COPY . .
RUN npm test
RUN npm prune --production

FROM node:9-alpine as runner
WORKDIR /app
COPY --from=builder node_modules node_modules
COPY E:\\RAW_ARCHIVE E:\\RAW_ARCHIVE
COPY package.json .
COPY index.js .
CMD npm start