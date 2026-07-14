FROM node:20-bullseye-slim

# Install Python3 (untuk main.py / keylogger checker)
RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files dulu agar npm install ter-cache
COPY package.json ./

# Install dependencies bersih (tanpa package-lock agar tidak ada path Replit)
RUN npm install

# Copy sisa file project
COPY . .

CMD ["node", "bot.js"]
