FROM node:alpine3.18 as builder
COPY package* ./
RUN npm install
COPY . .
RUN npm test
RUN npm prune --production
RUN npm audit fix --force

FROM node:alpine3.18 as runner

ENV USERMAP_UID 1000

WORKDIR /app
COPY --from=builder node_modules node_modules
COPY E:\\RAW_ARCHIVE E:\\RAW_ARCHIVE
COPY package.json .
COPY index.js .
COPY config.js .
COPY db.js .
COPY minimist/package.json /usr/local/lib/node_modules/npm/node_modules/mkdirp/node_modules/minimist/
COPY ansi-regex/package.json /usr/local/lib/node_modules/npm/node_modules/yargs/node_modules/ansi-regex/package.json

EXPOSE 3000

#Manually install dependancies due to breaking changes
RUN npm install && \
    npm install --save-dev mocha@9.2.2 && \
    npm install --save-dev ajv@8.11.0 && \
    npm install --save-dev rewire@6.0.0 && \
    npm audit fix

#npm audit show 0 vulnerabilities
RUN npm audit

#Upgrade to versions instructed by trivy
RUN npm install --save-dev ansi-regex@3.0.1 && \
    npm install --save-dev  minimist@1.2.6 && \
    npm list | grep ansi-regex && \
    npm list | grep minimist


USER ${USERMAP_UID}

ENV AWS_ACCESS_KEY_ID ${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}
ENV BUCKET_NAME ${BUCKET_NAME}

CMD ["npm","start"]
