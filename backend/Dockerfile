FROM node:20

# Install netcat for database connection checking
RUN apt-get update && apt-get install -y netcat-traditional

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Make start script executable
RUN chmod +x start.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/test || exit 1

# Use the start script
CMD ["./start.sh"]
