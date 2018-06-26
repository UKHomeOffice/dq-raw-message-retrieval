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
EXPOSE 3000
ENV USERMAP_UID 1000
USER ${USERMAP_UID}
USER rmr:rmr
    && adduser --disabled-password --gecos "" --uid ${USERMAP_UID} rmr \
ENV AWS_ACCESS_KEY_ID ${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}
ENV BUCKET_NAME ${BUCKET_NAME}
CMD npm start
