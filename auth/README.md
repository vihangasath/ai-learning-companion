# Authentication Service (Member 3)

> User Authentication & Authorization

## Owner
Member 3 — Database & Knowledge System Engineer

## Tech Stack
- JWT Tokens
- OAuth 2.0
- Firebase Auth / Auth0
- Role-Based Access Control (RBAC)

## Structure
```
auth/
├── providers/       # Auth provider implementations (JWT, OAuth, Firebase)
├── middleware/      # Authentication middleware
├── utils/           # Auth utility functions
└── tests/           # Auth tests
```

## Responsibilities
- User registration & login
- Session validation & token management
- OAuth integration (Google, GitHub, etc.)
- Role-based access control (Student, Administrator)
- Password hashing & security

## Roles
| Role | Access Level |
|------|-------------|
| Student | Standard user features |
| Administrator | Full system access |
