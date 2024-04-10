# Use a Node.js image as base
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to container
COPY . .

# Command to run the consumer_two service
CMD ["node", "item_creation.js"]
