# File: CIV6707-Couts-Lignes/frontend/Dockerfile

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
#COPY . .
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true
EXPOSE 3000
CMD ["npm", "start"]