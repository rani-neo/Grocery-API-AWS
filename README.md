# Grocery REST API – AWS Serverless Deployment

A serverless Grocery REST API built with **Node.js and Express.js** and deployed on **Amazon Web Services (AWS)**.

The application provides RESTful endpoints for managing products, orders, and employees. It includes employee authentication using **JWT** and stores application data in **Amazon DynamoDB**.

## Architecture

```text
Client / Postman
       |
       v
Amazon API Gateway
       |
       v
AWS Lambda
       |
       v
Node.js + Express.js
       |
       v
Amazon DynamoDB
```

## Technologies Used

### Backend
- Node.js
- Express.js
- JavaScript
- REST API
- bcryptjs
- JSON Web Token (JWT)
- CORS

### AWS
- AWS Lambda
- Amazon API Gateway (HTTP API)
- Amazon DynamoDB
- AWS IAM
- Amazon CloudWatch
- AWS SDK for JavaScript v3

### Development Tools
- Git
- GitHub
- Postman
- Visual Studio Code
- PowerShell

## AWS Services

### AWS Lambda

The Express application is deployed as a serverless AWS Lambda function.

`serverless-http` is used to adapt the Express application to the AWS Lambda execution environment.

### Amazon API Gateway

Amazon API Gateway provides the public HTTP interface for the Lambda function.

Routes are forwarded to the Express application using:

```text
ANY /
ANY /{proxy+}
```

### Amazon DynamoDB

The application uses three DynamoDB tables:

| Table | Partition Key | Type |
|---|---|---|
| GroceryProducts | ProductCode | Number |
| GroceryOrders | OrderNo | Number |
| GroceryEmployees | Username | String |

DynamoDB is accessed using the AWS SDK for JavaScript v3.

### AWS IAM

The Lambda execution role uses permissions required to access the DynamoDB tables.

The application uses DynamoDB operations including:

- GetItem
- PutItem
- UpdateItem
- DeleteItem
- Scan

### Amazon CloudWatch

AWS CloudWatch is used to monitor Lambda executions and troubleshoot runtime errors.

## Authentication

The API uses **JWT authentication**.

Employee passwords are hashed using **bcryptjs** before being stored in DynamoDB.

Authentication flow:

```text
Employee Registration
        |
        v
Password Hashing
        |
        v
DynamoDB

Employee Login
        |
        v
JWT Generated
        |
        v
Bearer Token
        |
        v
Protected API Routes
```

Protected requests use:

```text
Authorization: Bearer <JWT_TOKEN>
```

Secrets and environment-specific configuration are stored as environment variables and are not committed to the repository.

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Orders

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id
```

### Employees

```text
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
```

## Example Product

```json
{
  "ProductCode": 1001,
  "ProductName": "Milk",
  "ProductQuantity": 10,
  "Product_price": 3.5
}
```

## Example Order

```json
{
  "OrderNo": 5001,
  "OrderDate": "2026-09-18T10:30:00+10:00",
  "CustomerNumber": 101,
  "ProductCode": 1001,
  "ProductName": "Milk",
  "ProductQuantity": 2,
  "ProductPrice": 3.5,
  "TotalAmount": 7,
  "ModeOfPayment": "Card"
}
```

## Environment Variables

The Lambda function uses environment variables such as:

```text
PRODUCTS_TABLE
ORDERS_TABLE
EMPLOYEES_TABLE
JWT_SECRET
```

Actual secret values are not stored in this repository.

## Running Locally

Install dependencies:

```bash
npm install
```

Create a local `.env` file for required environment variables.

Do not commit the `.env` file.

## Deployment

The application is deployed using the following AWS serverless architecture:

```text
GitHub Source Code
        |
        v
AWS Lambda
        |
        v
Amazon API Gateway
        |
        v
Express REST API
        |
        v
Amazon DynamoDB
```

The Lambda deployment package contains the application source code and production dependencies.

## Testing

The API was tested using **Postman**, including:

- Employee registration
- Employee login
- JWT generation
- Bearer-token authentication
- Product creation and retrieval
- Order creation
- DynamoDB persistence
- API Gateway routing
- Lambda execution

## Security

Security measures include:

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API endpoints
- IAM permissions for DynamoDB access
- Environment variables for secrets
- `.env` excluded from Git
- Deployment ZIP files excluded from Git
- `node_modules` excluded from Git

## Project Structure

```text
Grocery-API-AWS/
│
├── config/
│   └── dynamodb.js
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   ├── orderRoutes.js
│   └── productRoutes.js
│
├── authserver.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Key Learning Outcomes

This project demonstrates practical experience with:

- Building REST APIs with Node.js and Express
- Designing serverless applications on AWS
- Deploying Express applications to AWS Lambda
- Configuring HTTP APIs with Amazon API Gateway
- Working with NoSQL databases using DynamoDB
- Implementing JWT authentication
- Hashing passwords securely
- Configuring IAM permissions
- Using CloudWatch for troubleshooting
- Testing REST APIs using Postman
- Managing source code using Git and GitHub

## Author

**Rashmi Rani**

Full Stack Developer | AWS Cloud & DevOps# Rest-api
