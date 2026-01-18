FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
