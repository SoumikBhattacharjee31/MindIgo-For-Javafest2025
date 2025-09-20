FROM node:alpine

WORKDIR /app

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG SIGNALING_SERVER_URL

# Set environment variables from build args
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV SIGNALING_SERVER_URL=$SIGNALING_SERVER_URL

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application with environment variables
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]