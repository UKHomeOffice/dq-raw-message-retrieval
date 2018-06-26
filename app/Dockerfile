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
USER rmr:rmr \
&& adduser -D -g '' --uid ${USERMAP_UID} rmr
USER ${USERMAP_UID}
ENV USERMAP_UID ${UID}
ENV AWS_ACCESS_KEY_ID ${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}
ENV BUCKET_NAME ${BUCKET_NAME}
CMD npm start
