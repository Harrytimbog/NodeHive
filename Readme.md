# NodeHive: A Social Media Microservices Platform

NodeHive is a scalable, modular social media platform built with microservices architecture. Each service operates independently, communicating via RabbitMQ and utilizing a central API Gateway for routing.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Services](#services)
- [Technologies Used](#technologies-used)
- [Setup and Deployment](#setup-and-deployment)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Management**: User authentication and authorization with JWT.
- **Post Management**: Create, read, update, and delete posts.
- **Media Management**: Upload and delete media files with Cloudinary integration.
- **Search**: Search functionality for posts and users.
- **Caching**: Redis caching for improved performance.
- **Message Queue**: RabbitMQ for asynchronous communication between services.
- **Scalability**: Each service is containerized and deployable independently.

---

## Architecture

NodeHive follows the microservices architecture, with the following services:

1. **API Gateway**:

   - Central entry point for all API requests.
   - Routes requests to appropriate microservices.

2. **Identity Service**:

   - Handles user registration, authentication, and JWT management.

3. **Post Service**:

   - Manages post creation, editing, deletion, and retrieval.

4. **Media Service**:

   - Uploads and deletes media files via Cloudinary.

5. **Search Service**:
   - Provides search functionality for posts and users.

---

## Services

| Service          | Port | Description                         |
| ---------------- | ---- | ----------------------------------- |
| API Gateway      | 3000 | Routes requests to other services   |
| Identity Service | 3001 | User management and authentication  |
| Post Service     | 3002 | CRUD operations for posts           |
| Media Service    | 3003 | Handles media uploads and deletions |
| Search Service   | 3004 | Search functionality                |

---

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **Containerization**: Docker, Docker Compose
- **Cloud Storage**: Cloudinary
- **API Gateway**: Express.js
- **Rate Limiting**: `express-rate-limit`, `rate-limiter-flexible`

---

## Setup and Deployment

### Prerequisites

- Node.js
- Docker and Docker Compose
- RabbitMQ
- Redis
- MongoDB
- Cloudinary Account

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/Harrytimbog/NodeHive.git
   cd NodeHive

   ```

2. Install dependencies for each service:

   ```bash
    cd <service-name>
    npm install
   ```

3. Start services locally:

   ```bash
    docker-compose up --build
   ```

4. Access the API Gateway at:

   ```bash
    http://localhost:3000
   ```

API Endpoints
Authentication (via API Gateway)
Register User

- POST /v1/auth/register
  Body:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123"
}
```

Login User

- POST /v1/auth/login

  Body:

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

Post Service

- Create Post:

  - POST /v1/posts
  - Requires JWT token.

- Get Posts:

  - GET /v1/posts?page=1&limit=10

Media Service

- Upload Media:

  - POST /v1/media/upload
  - Requires a file upload.
  - Delete Media:

- DELETE /v1/media/:mediaId

Environment Variables
API Gateway

Variable | Description
PORT | Port for the API Gateway
IDENTITY_SERVICE_URL | URL for the Identity Service
POST_SERVICE_URL URL | for the Post Service
MEDIA_SERVICE_URL URL | for the Media Service
SEARCH_SERVICE_URL | URL for the Search Service
JWT_SECRET | JWT secret key
REDIS_URL | Redis connection URL
RABBITMQ_URL | RabbitMQ connection URL

Identity | Service
Variable | Description
PORT | Port for the Identity Service
MONGODB_URI | MongoDB connection URL
JWT_SECRET | JWT secret key
REDIS_URL | Redis connection URL
RABBITMQ_URL | RabbitMQ connection URL

Post Service
Variable | Description
PORT | Port for the Post Service
MONGODB_URI | MongoDB connection URL
JWT_SECRET | JWT secret key
REDIS_URL | Redis connection URL
RABBITMQ_URL | RabbitMQ connection URL

Media Service
Variable | Description
PORT | Port for the Media Service
MONGODB_URI | MongoDB connection URL
CLOUDINARY_CLOUD_NAME | Cloudinary cloud name
CLOUDINARY_API_KEY | Cloudinary API key
CLOUDINARY_API_SECRET | Cloudinary API secret
REDIS_URL | Redis connection URL
RABBITMQ_URL | RabbitMQ connection URL
