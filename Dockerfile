FROM node:18-alpine
ENV HTTP_PROXY=http://cm.dga.gob.ni:8080
ENV HTTPS_PROXY=http://cm.dga.gob.ni:8080
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD ["npm","run","start-prod"]