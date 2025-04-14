# Use an official Node.js runtime as a parent image
FROM node:20.18.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies first
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install express mysql2 cors body-parser multer axios


#RUN npm install mysql@latest
# Copy the rest of your application code
COPY . .

# Expose the port that the app will run on
EXPOSE 3004

# Run the app when the container starts
CMD ["node", "server.js"]
