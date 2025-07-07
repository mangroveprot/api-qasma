# QR CODE-ENABLED APPOINTMENT AND SCHEDULING MANAGER APPLICATION API🚀

The QR Code-Enabled Appointment and Scheduling Manager Application (QASMA) is built on a simple and lightweight Node.js boilerplate using TypeScript. This project integrates Docker configurations to run the application seamlessly in both development and production modes, offering scalability and ease of deployment. It also includes advanced security features such as rate limiting and brute force protection to ensure safe and reliable operation. The application leverages QR code functionality to provide efficient, easy-to-manage scheduling and appointment booking systems.

---

## Table of Contents 📋

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Project Structure](#project-structure)
5. [Scripts Explanation](#scripts-explanation)
6. [Environment Variables](#environment-variables)
7. [Docker Configuration](#docker-development-configuration)
8. [Security Features](#security-features)
9. [Commit Message Guidelines](#commit-message-guidelines)
10. [Accessing Services](#accessing-services)
11. [Documentation](#documentation)
12. [Contributing](#contributing)

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (version 18 or above)
- Docker
- Docker Compose

## Installation

To set up the project, follow these steps:

1. **Clone the repository**:

   ```sh
   git clone https://github.com/mangroveprot/api-qasma.git
   cd api-qasma
   ```

2. **Run the installation script**:

   ```sh
   bash bin/install.sh
   ```

   This script will:

   - Copy the `.env.example` file to `.env`.
   - Install the necessary npm dependencies.

## Running the Application

You can run the application in either development or production mode.

### Development Mode

To run the application in development mode:

```sh
bash bin/start.sh
```

### Production Mode

To run the application in production mode:

```sh
bash bin/start.sh --prod
```

## Project Structure

Here is an overview of the project's structure:

```
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierrc
├── .vscode
    └── settings.json
├── DOCS.md
├── Dockerfile
├── README.md
├── bin
    ├── install.sh
    └── start.sh
├── docker-compose.dev.yml
├── docker-compose.yml
├── nodemon.json
├── package-lock.json
├── package.json
├── src
    ├── apps
    │   ├── appointment-config
    │   │   ├── controllers
    │   │   │   ├── appointmentConfig.controller.ts
    │   │   │   └── index.ts
    │   │   ├── models
    │   │   │   ├── appointmentConfig.model.ts
    │   │   │   └── index.ts
    │   │   ├── repositories
    │   │   │   ├── appointmentConfig.repo.ts
    │   │   │   └── index.ts
    │   │   ├── routes
    │   │   │   ├── appointmentConfig.route.ts
    │   │   │   └── index.ts
    │   │   ├── services
    │   │   │   ├── appointmentConfig.service.ts
    │   │   │   └── index.ts
    │   │   ├── types
    │   │   │   ├── IAppointmentConfig.ts
    │   │   │   └── index.ts
    │   │   └── validations
    │   │   │   ├── appointmentConfig.ts
    │   │   │   └── index.ts
    │   ├── appointment
    │   │   ├── controllers
    │   │   │   ├── appointment.controller.ts
    │   │   │   └── index.ts
    │   │   ├── models
    │   │   │   ├── appointment.model.ts
    │   │   │   └── index..ts
    │   │   ├── repositories
    │   │   │   ├── appointment.repo.ts
    │   │   │   └── index.ts
    │   │   ├── routes
    │   │   │   ├── appointment.route.ts
    │   │   │   └── index.ts
    │   │   ├── services
    │   │   │   ├── appointment.service.ts
    │   │   │   └── index.ts
    │   │   ├── types
    │   │   │   ├── appointment
    │   │   │   │   ├── CheckInStatus.ts
    │   │   │   │   ├── IAppointment.ts
    │   │   │   │   ├── Status.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── validation
    │   │   │   ├── appointment.ts
    │   │   │   └── index.ts
    │   ├── auth
    │   │   ├── controllers
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── index.ts
    │   │   │   └── otp.controller.ts
    │   │   ├── models
    │   │   │   ├── _plugins
    │   │   │   │   ├── attemp-limiting.plugin.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── index.ts
    │   │   │   └── otp.model.ts
    │   │   ├── repositories
    │   │   │   ├── index.ts
    │   │   │   └── otp.repo.ts
    │   │   ├── routes
    │   │   │   ├── auth.routes.ts
    │   │   │   ├── index.ts
    │   │   │   └── otp.routes.ts
    │   │   ├── services
    │   │   │   ├── auth.service.ts
    │   │   │   ├── index.ts
    │   │   │   └── otp.service.ts
    │   │   ├── types
    │   │   │   ├── IOTP.ts
    │   │   │   └── index.ts
    │   │   └── validators
    │   │   │   ├── auth.ts
    │   │   │   └── index.ts
    │   └── users
    │   │   ├── controllers
    │   │       ├── index.ts
    │   │       └── user.controller.ts
    │   │   ├── index.ts
    │   │   ├── models
    │   │       ├── firebase
    │   │       │   └── index.ts
    │   │       ├── index.ts
    │   │       └── mongoose
    │   │       │   ├── index.ts
    │   │       │   └── user-student.mogoose.model.ts
    │   │   ├── repositories
    │   │       ├── index.ts
    │   │       └── user.repo.ts
    │   │   ├── routes
    │   │       ├── index.ts
    │   │       └── user.routes.ts
    │   │   ├── services
    │   │       ├── index.ts
    │   │       └── user.service.ts
    │   │   └── types
    │   │       ├── index.ts
    │   │       └── user
    │   │           ├── IUser.ts
    │   │           ├── TOICounselor.ts
    │   │           ├── TOIStaff.ts
    │   │           ├── TOIStudent.ts
    │   │           ├── UserRole.ts
    │   │           └── index.ts
    ├── common
    │   ├── global-router
    │   │   └── index.ts
    │   └── shared
    │   │   ├── index.ts
    │   │   ├── middlewares
    │   │       ├── attach-user-context.ts
    │   │       ├── authenticate-req-with-user-attach.ts
    │   │       ├── authorize-role.ts
    │   │       ├── index.ts
    │   │       ├── rate-limiter.ts
    │   │       └── validate.ts
    │   │   ├── services
    │   │       ├── async-localstorage.service.ts
    │   │       ├── index.ts
    │   │       ├── jwt.service.ts
    │   │       ├── logger.service.ts
    │   │       ├── mail
    │   │       │   ├── index.ts
    │   │       │   ├── mail.service.ts
    │   │       │   └── mail.service.utility.ts
    │   │       ├── qrcode.service.ts
    │   │       └── redis.service.ts
    │   │   ├── templates
    │   │       ├── otp-verification.html
    │   │       └── welcome.html
    │   │   ├── types
    │   │       ├── index.ts
    │   │       └── service-response.ts
    │   │   └── utils
    │   │       ├── error
    │   │           ├── codes.ts
    │   │           ├── global.ts
    │   │           ├── index.ts
    │   │           ├── notFound.ts
    │   │           └── response.ts
    │   │       ├── index.ts
    │   │       └── response
    │   │           ├── api-response.ts
    │   │           └── index.ts
    ├── core
    │   ├── config
    │   │   └── index.ts
    │   ├── engine
    │   │   ├── base
    │   │   │   ├── _models
    │   │   │   │   ├── _plugins
    │   │   │   │   │   ├── auditTrail.plugin.ts
    │   │   │   │   │   ├── history.plugin.ts
    │   │   │   │   │   ├── index.plugin.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── soft-delete.plugin.ts
    │   │   │   │   │   └── versioning.plugin.ts
    │   │   │   │   ├── base.model.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── _repositories
    │   │   │   │   ├── base.repostitories.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── _services
    │   │   │   │   ├── base.service.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   └── framework
    │   │   ├── databases
    │   │       ├── index.ts
    │   │       ├── mongoose
    │   │       │   ├── index.ts
    │   │       │   └── mongodb.ts
    │   │       └── redis
    │   │       │   ├── index.ts
    │   │       │   └── redis.ts
    │   │   ├── index.ts
    │   │   └── webserver
    │   │       ├── express.ts
    │   │       └── index.ts
    ├── helpers
    │   ├── date-and-time.ts
    │   ├── db-connection-selection.ts
    │   ├── generateRandomOTP.ts
    │   ├── generateSlots.ts
    │   ├── index.ts
    │   ├── init-services.ts
    │   ├── mergeCounselorsUnavailableTimes .ts
    │   ├── redis-test.ts
    │   └── string.ts
    ├── server.ts
    └── types
    │   ├── index.ts
    │   ├── profile.ts
    │   ├── staff.ts
    │   ├── student.ts
    │   └── user.ts
└── tsconfig.json
```

## Scripts Explanation

### `bin/install.sh`

This script sets up the project by performing the following tasks:

- Copies the `.env.example` file to `.env`, replacing any existing `.env` file.
- Installs npm dependencies.

### `bin/start.sh`

This script runs the application by performing the following tasks:

- Checks if Docker and Docker Compose are installed.
- Runs the `install.sh` script to ensure dependencies are installed.
- Sets the `NODE_ENV` environment variable based on the provided argument (`--prod` for production).
- Starts the Docker containers using Docker Compose.

## Dockerfile

The Dockerfile defines how the Docker image is built. It includes steps for setting up the working directory, installing dependencies, copying the source code, building the TypeScript project, and defining the startup command.

## docker-compose.dev.yml

This file defines the Docker services for the application, including the application itself, MongoDB, Redis, and Maildev. It uses environment variables from the `.env` file to configure the services.

## docker-compose.yml

This file defines the Docker services for the application, including the application itself.It uses environment variables from the .env file to configure the services.

## Environment Variables

The `.env` file contains the environment variables required by the application. It is generated from the `.env.example` file during installation. Ensure the following variables are set:

```env
# Engine
APP_NAME="api-qasma"
PORT=9095

# dbType
DATABASE_TYPE="mongodb"

# mongoose
MONGO_URI=""
MONGOOSE_DBNAME=""

DB_URI=mongodb://mongo:27017
DB_NAME=qasma-mongodb
MONGO_CLIENT_PORT=9005

# jwt tokens
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRE_TIME= # hour
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRE_TIME= # days
TOKEN_ISSUER=

# SALT
SALT_ROUNDS=10

# time-zone
TIME_ZONE=Asia/Manila

# redis (LOCAL)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_SERVER_PORT=9709
REDIS_TOKEN_EXPIRE_TIME=31536000 # 1 year in seconds (validity for refresh token)
REDIS_BLACKLIST_EXPIRE_TIME=2592000 # 1 month in seconds

# redis (cloud)
REDIS_CLOUD_HOST=redis
REDIS_CLOUD_PORT=
REDIS_PASSWORD=

# api limiter
RATE_LIMIT_WINDOW_MS=100
RATE_LIMIT_MAX=100

# OTP
OTP_EXPIRATION=5
OTP_LENGTH=6

# Maildev
MAILDEV_HOST=maildev
MAILDEV_PORT=1025
MAILDEV_SMTP=9025
MAILDEV_WEBAPP_PORT=9080

# SMTP (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Mail Senders
FROM_EMAIL=
FROM_NAME=QASMA
```

## Docker Development Configuration

The Docker configuration allows the application to run in isolated containers. The services defined in `docker-compose.yml` include:

- **app**: The main Node.js application.
- **mongo**: MongoDB database service.
- **redis**: Redis caching service.
- **maildev**: Maildev service for testing email sending.

### Building and Starting Docker Containers

To build and start the Docker containers, run:

## Docker Production Configuration

The Docker configuration allows the application to run in isolated containers. The services defined in `docker-compose.yml` include:

- **app**: The main Node.js application.
- **mongo**: MongoDB database service.
- **redis**: Redis caching service.
- **maildev**: Maildev service for testing email sending.

### Building and Starting Docker Containers

To build and start the Docker containers, run:

```sh
docker-compose up --build
```

This command will build the Docker images and start the services defined in `docker-compose.yml`.

## Security Features

### Rate Limiting

The rate limiter middleware is configured to limit the number of requests to the API within a specified time window. This helps protect against DoS attacks.

### Brute Force Protection

Brute force protection is implemented using `express-brute` and `express-brute-mongo`. It limits the number of failed login attempts and progressively increases the wait time between attempts after reaching a threshold.

### Hiding Technology Stack

The `helmet` middleware is used to hide the `X-Powered-By` header to obscure the technology stack of the application.

### Content Security Policy

A strict content security policy is enforced using the `helmet` middleware to prevent loading of unauthorized resources.

### Running Prettier

To format your code:

```sh
npm run format
```

## Commit Message Guidelines

To ensure consistent commit messages, this project uses commitlint with husky to enforce commit message guidelines.

### Commit Message Format

- **build**: Changes that affect the build system or external dependencies
- **chore**: Miscellaneous changes that don't affect the main codebase (e.g., configuring development tools, setting up project-specific settings)
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **update**: Update something for a specific use case
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (e.g., white-space, formatting, missing semi-colons)
- **test**: Adding missing tests or correcting existing tests
- **translation**: Changes related to translations or language localization
- **sec**: Changes that address security vulnerabilities, implement security measures, or enhance the overall security of the codebase

## Accessing Services

After running the application, you can access the following services:

- **Node.js Application**: [http://localhost:9095](http://localhost:9095)
- **MongoDB**: Accessible on port `9005`
- **Redis**: Accessible on port `9079`
- **MailDev SMTP (external)**: Accessible on port `9025`
- **MailDev WebApp**: Accessible on port `9080`

## Documentation

You can see it [here](DOCS.md).

## Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/fless-lab/node-ts-starter/issues) if you want to contribute.

Don't forget to give a star if you find this project useful! ⭐
