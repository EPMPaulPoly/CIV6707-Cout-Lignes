FROM node:14
WORKDIR /app
COPY package*.json ./
COPY config.js ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]