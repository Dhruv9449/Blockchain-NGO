# Use Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Tailwind CSS
RUN npm install && \
    npm install -D tailwindcss@latest postcss@latest autoprefixer@latest && \
    npx tailwindcss init -p

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
