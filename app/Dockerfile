FROM node:10-alpine as builder
COPY package* ./
RUN npm install
COPY . .
RUN npm test
RUN npm prune --production

FROM node:10-alpine as runner

ENV USERMAP_UID 1000

WORKDIR /app
COPY --from=builder node_modules node_modules
COPY E:\\RAW_ARCHIVE E:\\RAW_ARCHIVE
COPY package.json .
COPY index.js .

EXPOSE 3000

USER ${USERMAP_UID}

ENV AWS_ACCESS_KEY_ID ${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}
ENV BUCKET_NAME ${BUCKET_NAME}

CMD ["npm","start","--inspect"]
