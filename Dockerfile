FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

ENV MYSQL_HOST=13.235.8.187\
    MYSQL_USER=root\
    MYSQL_DATABASE=db_perfex \
    MYSQL_PASSWORD=password

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]