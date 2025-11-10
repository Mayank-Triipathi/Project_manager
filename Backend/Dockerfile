FROM node:22

# create working directory inside container
WORKDIR /app

# copy package.json + package-lock.json first
COPY package*.json ./

# install dependencies inside container
RUN npm install

# copy rest of backend code
COPY . .

# expose the port your backend uses
EXPOSE 8000

# start backend
CMD ["node", "server.js"]
