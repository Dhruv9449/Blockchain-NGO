# Use Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    npm install -D tailwindcss@latest postcss@latest autoprefixer@latest && \
    npx tailwindcss init -p

# Copy project files
COPY . .

# Create the output directory for Tailwind CSS
RUN mkdir -p src/styles

# Build Tailwind CSS
RUN npm run build:css

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
