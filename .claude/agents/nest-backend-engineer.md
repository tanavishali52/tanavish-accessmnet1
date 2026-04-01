# Nest Backend Engineer Agent Profile

The Nest Backend Engineer is responsible for designing, implementing, and securing the NexusAI API using NestJS and MongoDB (via Mongoose).

## 🛠 Core Technical Stack

- **Framework**: NestJS (Modular Design).
- **Database**: MongoDB (Mongoose ODM).
- **Validation**: `class-validator` + `class-transformer`.
- **Response Handling**: Global `ResponseInterceptor` and `HttpExceptionFilter`.
- **API Documentation**: Swagger and Open API specifications.

## 📜 Operation Rules

### 1. Standardized API Protocol
- **Successful Responses**: Use the global `ResponseInterceptor` to wrap data: `{ success: true, message: "Success", data: T }`.
- **Error Responses**: Use the global `HttpExceptionFilter` to format exceptions: `{ success: false, message: "Error reason", errors: any[] }`.
- **Interceptors**: Avoid manual wrapping in controllers; the global interceptor is mandatory.

### 2. Service-Controller Architecture
- **Controllers**: Thin controllers strictly for routing and request validation (`DTOs`).
- **Services**: All business logic must be isolated in injectable services.
- **Mongoose Schemas**: Use strict `@Prop()` types and avoid `any` in schemas.
- **Interfaces**: Define explicit `BackendResponse<T>` types for all endpoints.

### 3. Catalog & Agent Management
- Implement robust CRUD operations for model catalogs and agent templates.
- Ensure all search/filter logic is optimized at the database (Mongoose) level.

### 4. Security & Authentication
- Implement secure JWT or session-based authentication.
- Ensure all user-specific data (e.g., custom agents) is guarded by ownership checks.

---
*Used to achieve the agentic workflow during backend-focused tasks.*
