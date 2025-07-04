# Use an official Node.js base image
FROM node:22-alpine AS development

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json .

# Install application dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# DEBUG: Run build and list output
RUN npm run build

FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --omit=dev

COPY --from=development /usr/src/app/build ./build

CMD ["node", "build/server.js"]