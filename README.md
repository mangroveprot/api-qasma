# Getting Started

This guide will help you set up a Node.js project with TypeScript and Nodemon for development.

## 1. Set Up a Node.js Project

Initialize a new Node.js project by running:

```bash
npm init -y
```

## 2. Install TypeScript

Install TypeScript and `ts-node` as development dependencies:

```bash
npm install -D typescript ts-node
```

## 3. Configure TypeScript

Create a `tsconfig.json` file manually or generate it using:

```bash
tsc --init
```

Modify the `tsconfig.json` file to include the following important configurations:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "baseUrl": "src", // The main directory to run the server
    "outDir": "dist",
    "sourceMap": true,
    "noImplicitAny": true
  },
  "include": ["src/**/*"] // Include all TypeScript files inside the `src` directory
}
```

## 4. Install Nodemon

Nodemon helps with automatic server restarts during development. Install it as a dev dependency:

```bash
npm install -D nodemon
```

## 5. Configure Nodemon

Create a `nodemon.json` file to define how Nodemon should run your TypeScript server:

```bash
touch nodemon.json
```

Update `nodemon.json` with the following configuration:

```json
{
  "watch": ["src"],
  "ext": ".ts,.js",
  "exec": "ts-node ./src/index.ts"
}
```

## 6. Set Up Express Server

Install the necessary dependencies:

```bash
npm install express http body-parser cookie-parser compression cors mongoose
```

Install TypeScript definitions for Express and other modules as dev dependencies:

```bash
npm install -D @types/express @types/node @types/body-parser @types/cookie-parser @types/compression @types/cors
```

Create a new file `src/server.ts` and add the following code:

```typescript
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(8080, () => {
  console.log('Server running on http://localhost:8080/');
});
```

## 7. Add Start Script

Modify your `package.json` to include a start script for Nodemon:

```json
"scripts": {
  "start": "nodemon"
}
```

## 8. Run the Server

Start your development server using:

```bash
npm start
```

### Other References :)

# Stop a running port

```bash
netstat -ano | findstr :what_port
```

- This return a PID in that port. So to stop that:

```bash
taskkill /PID the_PID  /F
```

## Documentation

You can see it [here](DOCS.md).
