# Usa Node.js para desenvolvimento
FROM node:20

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta padrão do React (3000)
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]