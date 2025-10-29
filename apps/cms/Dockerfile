FROM node:20-alpine

# Set working directory
WORKDIR /opt/

# Copy package files
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Set app working directory
WORKDIR /opt/app

# Copy app files
COPY ./ .

# Build application
RUN NODE_ENV=production pnpm run build

# Expose port
EXPOSE 1337

# Start application
CMD ["pnpm", "start"]
