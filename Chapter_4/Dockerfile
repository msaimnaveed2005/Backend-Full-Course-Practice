# Use an official node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Install OpenSSL (required by Prisma engines on Alpine Linux)
RUN apk add --no-cache openssl

# Copy the package.json and the package-lock.json files to the container
COPY package*.json .

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client for the container environment
RUN npx prisma generate


# Expose the port that the app runs on
EXPOSE 5003

# Define the command to run your application (generate client on start so volume has it)
CMD ["sh", "-c", "npx prisma generate && node ./src/server.js"]