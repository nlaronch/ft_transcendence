FROM node:18-alpine As dev

#RUN apk add build-base

#ENV PYTHONUNBUFFERED=1
#RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
#RUN python3 -m ensurepip
#RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add --update --no-cache build-base python3 py3-pip

RUN npm install -g @nestjs/cli

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN mkdir -p node_modules dist
RUN chown -R node:node .
RUN chmod 755 -R .

COPY --chown=node:node . .

RUN npm ci


FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=dev /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

#RUN npm ci --omit=dev && npm cache clean --force

USER node




FROM node:18-alpine As prod

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
