# Use an official Node.js base image
FROM node:22-alpine as development

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json .

# Install application dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the TypeScript project
RUN npm run build

FROM node:16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

COPY --from=development /usr/src/app/build ./build

CMD ["node", "build/server.js"]