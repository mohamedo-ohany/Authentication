# PHP RESTful Authentication API (JWT + Docker)

A **secure, lightweight, and production-ready RESTful API** built with **Vanilla PHP 8.x**, implementing **JWT authentication**, **HttpOnly Cookies**, and a **custom MVC routing engine**.

This API provides a **complete user authentication system** including:

* User Registration
* User Login
* Session Validation
* Secure JWT Authentication

It is designed to integrate easily with **modern frontends** such as:

* React
* Vue
* Angular
* Next.js
* Mobile apps (Flutter / React Native / Swift / Kotlin)

---

# Overview

This project acts as a **secure backend service** responsible for managing user accounts and authentication sessions.

The system uses **JSON Web Tokens (JWT)** for identity verification and supports **two authentication methods simultaneously**:

1. Authorization Header (`Bearer Token`)
2. Secure HttpOnly Cookie (`Token`)

This dual approach allows the API to work seamlessly with:

* Web browsers
* Mobile apps
* Third-party clients

---

# Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| Backend        | PHP 8.x (Strict Types)             |
| Database       | MySQL 8                            |
| Authentication | JWT (JSON Web Tokens)              |
| Infrastructure | Docker + Docker Compose            |
| Security       | BCRYPT, HttpOnly Cookies, SameSite |
| Architecture   | Custom MVC (OOP)                   |

---

# Project Architecture

```
.
├── website
│
│   ├── app
│   │
│   │   ├── Controllers
│   │   │   Handles incoming HTTP requests
│   │
│   │   ├── Core
│   │   │   Framework engine (Router, App, JWT, View)
│   │
│   │   ├── Models
│   │   │   Database interaction layer
│   │
│   │   ├── Units
│   │   │   Business logic modules (User, Uploaders)
│   │
│   │   └── Traits
│   │       Shared helpers (APIHelper, Errors)
│
│   └── public
│       └── index.php
│           Main application entry point
│
├── db
│   Database schema initialization
│
└── docker-compose.yml
    Container orchestration
```

---

# Request Flow

Every request goes through the following pipeline:

```
Client Request
     ↓
public/index.php
     ↓
Core\App
     ↓
Router
     ↓
Controller
     ↓
Unit / Model
     ↓
JSON Response
```

---

# Routing System

The API uses a **custom routing engine**.

All requests are routed through:

```
public/index.php
```

The router parses the URL in this format:

```
/controller/action/parameters
```

Example:

```
/user/login
/user/signup
/user/isloggedin
```

| Part       | Description                                     |
| ---------- | ----------------------------------------------- |
| Controller | Determines which controller handles the request |
| Action     | Determines which method will run                |
| Params     | Optional parameters                             |

---

# Base URL

When running with Docker:

```
http://localhost
```

Example endpoint:

```
http://localhost/user/signup
```

---

# Authentication System

The API uses **JWT tokens** for authentication.

Two authentication methods are supported:

---

## 1. Authorization Header

Recommended for:

* Mobile Apps
* External Clients
* Postman / API testing

Example:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. HttpOnly Secure Cookie

Recommended for:

* Web applications

Cookie properties:

| Property | Value                                |
| -------- | ------------------------------------ |
| HttpOnly | true                                 |
| SameSite | Lax                                  |
| Secure   | false (should be true in production) |

This protects against:

* XSS attacks
* CSRF risks

---

# API Endpoints

---

# 1. Register User

Creates a new user account.

### Endpoint

```
POST /user/signup
```

---

### Request Body

```
Content-Type: application/json
```

```json
{
  "username": "dev_user",
  "email": "user@example.com",
  "password": "securepassword"
}
```

---

### Validation Rules

| Field    | Rule                                 |
| -------- | ------------------------------------ |
| username | 3–50 characters, letters/numbers/._- |
| email    | RFC compliant email format           |
| password | minimum 6 characters                 |

---

### Success Response

```
200 OK
```

```json
{
  "ok": 1,
  "errors": [],
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

# 2. Login User

Authenticates a user using **username OR email**.

### Endpoint

```
POST /user/login
```

---

### Request Body

```json
{
  "username_email": "dev_user",
  "password": "securepassword"
}
```

You can send either:

```
username_email = username
```

or

```
username_email = email
```

---

### Success Response

```
200 OK
```

```json
{
  "ok": 1,
  "user": {
    "id": 1,
    "username": "dev_user",
    "email": "user@example.com"
  },
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Additionally the server sets a cookie:

```
Set-Cookie: Token=<JWT>; HttpOnly; SameSite=Lax
```

---

# 3. Check Session

Validates if the current user session is still active.

Useful for:

* SPA authentication check
* Page reload verification
* Session persistence

---

### Endpoint

```
POST /user/isloggedin
```

---

### Authentication

Either:

```
Authorization: Bearer <JWT>
```

or the **Token cookie**.

---

### Success Response

```json
{
  "ok": 1,
  "user": {
    "id": 1,
    "username": "dev_user",
    "email": "user@example.com"
  }
}
```

---

# Error Handling

All API errors follow a **consistent response schema**.

### Error Format

```json
{
  "ok": 0,
  "message": "Error description",
  "errors": {
    "field_name": [
      "Specific error message"
    ]
  }
}
```

---

# HTTP Status Codes

| Code | Meaning                |
| ---- | ---------------------- |
| 200  | Success                |
| 400  | Bad Request            |
| 401  | Unauthorized           |
| 405  | Method Not Allowed     |
| 415  | Unsupported Media Type |
| 422  | Validation Error       |

---

# Security Features

### Password Security

Passwords are hashed using:

```
password_hash(PASSWORD_DEFAULT)
```

Which currently uses **BCRYPT**.

Verification uses:

```
password_verify()
```

---

### Input Sanitization

All user input is validated using:

* Regex filters
* Length checks
* Email validation

Example username regex:

```
/^[a-zA-Z0-9._-]{3,50}$/
```

---

### SQL Injection Protection

All queries are executed using **prepared statements** through a custom **QueryBuilder**.

---

### URL Sanitization

The router sanitizes incoming URLs to prevent malicious characters.

---

# API Helper Trait

The `APIHelper` trait simplifies controller logic by automatically:

* Validating HTTP method
* Reading JSON body from `php://input`
* Parsing JSON to associative arrays
* Returning standardized responses

Example usage:

```php
$this->post = $this->getJsonInput();
```

---

# Running the Project

## Step 1 — Clone Repository

```
git clone <repo-url>
```

---

## Step 2 — Create Environment File

Copy the example file:

```
website/.env.example
```

to:

```
website/.env
```

Then update database credentials.

---

## Step 3 — Start Docker

```
docker-compose up --build
```

---

## Step 4 — Access Services

| Service    | URL                                            |
| ---------- | ---------------------------------------------- |
| API        | [http://localhost](http://localhost)           |
| phpMyAdmin | [http://localhost:8081](http://localhost:8081) |

---

# Example API Test

Using **curl**:

```
curl -X POST http://localhost/user/signup \
-H "Content-Type: application/json" \
-d '{"username":"dev_user","email":"dev@mail.com","password":"securepass"}'
```

---

# Known Issue (Important)

There is a **logic bug** in the login controller:

Current code:

```php
if(password_verify($this->post["password"], $this->userData["results"]["password_hash"])){
    $this->results["errors"]["password"][] = "Invalid Password.";
}
```

Correct version:

```php
if(!password_verify($this->post["password"], $this->userData["results"]["password_hash"])){
    $this->results["errors"]["password"][] = "Invalid Password.";
}
```

Without this fix, **all login attempts will fail**.
