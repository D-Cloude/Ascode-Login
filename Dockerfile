FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# 애플리케이션 실행
CMD ["node", "src/app.js"]