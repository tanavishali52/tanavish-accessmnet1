# Nexus AI - AI Agent Management Platform

> A comprehensive full-stack platform for managing, deploying, and interacting with AI agents. Built with modern technologies including NestJS, Next.js, MongoDB, and Redux.

## 📋 Overview

Nexus AI is a sophisticated platform that enables users to create, manage, and interact with AI agents through an intuitive interface. The platform provides agent marketplace, real-time chat capabilities, research tools, and a comprehensive agent builder for creating custom AI agents.

### Key Features

- **🤖 Agent Management**: Create, configure, and manage AI agents
- **💬 Real-time Chat**: Interact with AI agents through a responsive chat interface
- **🛒 Marketplace**: Browse and discover available AI agents
- **🔍 Research Tools**: Advanced research capabilities integrated into the platform
- **🔐 Authentication**: Secure user authentication with session management
- **📊 Dashboard**: Intuitive workspace for managing your agents and interactions
- **🎨 Modern UI**: Beautiful, responsive interface with smooth animations

## 🏗️ Project Structure

```
tanavish-accessmnet1/
├── nexus-ai-backend/          # NestJS backend server
│   ├── src/
│   │   ├── agents/            # Agent management module
│   │   ├── auth/              # Authentication module
│   │   ├── catalog/           # Catalog management
│   │   ├── chat/              # Chat functionality
│   │   ├── chat-hub/          # WebSocket chat hub
│   │   ├── common/            # Shared filters & interceptors
│   │   ├── data/              # Static data
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Application entry point
│   ├── test/                  # E2E tests
│   └── package.json
│
└── nexus-ai-hub/              # Next.js frontend application
    ├── src/
    │   ├── app/               # Next.js pages & routes
    │   │   ├── agents/        # Agents page
    │   │   ├── chat/          # Chat page
    │   │   ├── login/         # Login page
    │   │   ├── marketplace/   # Marketplace page
    │   │   └── signup/        # Signup page
    │   ├── components/        # Reusable React components
    │   │   ├── app/           # App-specific components
    │   │   ├── auth/          # Authentication components
    │   │   ├── landing/       # Landing page components
    │   │   └── shared/        # Shared UI components
    │   ├── lib/               # Utility functions & API client
    │   ├── store/             # Redux store & slices
    │   └── providers/         # React providers
    └── package.json
```

## 🔧 Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Validation**: Class Validator & Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Session Management**: Express Session with MongoDB store
- **Language**: TypeScript

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) - React framework
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanavishali52/tanavish-accessmnet1.git
   cd tanavish-accessmnet1
   ```

2. **Install Backend Dependencies**
   ```bash
   cd nexus-ai-backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../nexus-ai-hub
   npm install
   ```

### Configuration

Create a `.env` file in the `nexus-ai-backend` directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nexus-ai
MONGODB_ATLAS_URI=your_mongodb_atlas_uri

# Session
SESSION_SECRET=your_session_secret_key

# Server
NODE_ENV=development
PORT=3001
```

### Running the Application

#### Development Mode

**Backend:**
```bash
cd nexus-ai-backend
npm run start:dev
```

The backend will start on `http://localhost:3001`

**Frontend:**
```bash
cd nexus-ai-hub
npm run dev
```

The frontend will start on `http://localhost:3000`

#### Production Mode

**Backend:**
```bash
cd nexus-ai-backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd nexus-ai-hub
npm run build
npm run start
```

## 📚 Available Scripts

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start with watch mode |
| `npm run start:debug` | Start with debugging enabled |
| `npm run start:prod` | Start production build |
| `npm run build` | Build the project |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 📖 API Documentation

The backend provides Swagger/OpenAPI documentation at:
```
http://localhost:3001/api/docs
```

### Main Endpoints

- **Authentication**
  - `POST /auth/signup` - Register a new user
  - `POST /auth/login` - Login with credentials
  - `POST /auth/logout` - Logout user

- **Agents**
  - `GET /agents` - Get all agents
  - `POST /agents` - Create a new agent
  - `GET /agents/:id` - Get agent details
  - `PUT /agents/:id` - Update agent
  - `DELETE /agents/:id` - Delete agent

- **Chat**
  - `GET /chat` - Get chat history
  - `POST /chat` - Send message
  - `WebSocket /chat-hub` - Real-time chat connection

- **Catalog**
  - `GET /catalog` - Get catalog items
  - `GET /catalog/:id` - Get catalog item details

## 🏗️ Module Architecture

### Backend Modules

#### Agents Module
Manages agent creation, configuration, and retrieval. Handles agent lifecycle and metadata.

#### Auth Module
Handles user authentication, registration, and session management. Integrates with MongoDB for user storage.

#### Chat Module
Manages chat messages and conversation history between users and AI agents.

#### Chat Hub Module
WebSocket implementation for real-time chat communication.

#### Catalog Module
Manages the catalog of available agents and marketplace items.

### Frontend Store (Redux)

- **authSlice**: Authentication state (user info, login status)
- **agentSlice**: Agent management state
- **chatSlice**: Chat messages and conversation state
- **modalSlice**: Modal visibility states
- **modelsSlice**: AI models information
- **appSlice**: Global application state

## 🔐 Security Features

- Session-based authentication with MongoDB session store
- Password hashing and validation
- CORS protection
- Input validation using class-validator
- Type-safe implementations with TypeScript
- Secure cookie handling

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Modes**: Customizable theme support
- **Smooth Animations**: Framer Motion transitions
- **Component Library**: Reusable shared components
- **Toast Notifications**: User feedback system
- **Loading States**: Skeleton loaders for better UX

## 📦 Dependencies Overview

### Critical Backend Dependencies
- `@nestjs/core` & `@nestjs/common` - Core NestJS framework
- `@nestjs/mongoose` - MongoDB integration
- `mongoose` - Database ODM
- `@nestjs/swagger` - API documentation
- `express-session` & `connect-mongo` - Session management

### Critical Frontend Dependencies
- `next` - React framework
- `react` & `react-dom` - UI library
- `@reduxjs/toolkit` & `react-redux` - State management
- `tailwindcss` - CSS framework
- `framer-motion` - Animation library

## 🧪 Testing

### Backend Tests

Run unit tests:
```bash
cd nexus-ai-backend
npm test
```

Run with coverage:
```bash
npm run test:cov
```

Run E2E tests:
```bash
npm run test:e2e
```

## 📝 Development Guidelines

### Code Style

The project uses ESLint and Prettier for code consistency. Auto-formatting is configured.

Format code:
```bash
npm run format
```

Run linting:
```bash
npm run lint
```

### Best Practices

- Use TypeScript strict mode
- Follow NestJS module structure
- Keep components small and reusable
- Use Redux for state management
- Write meaningful commit messages
- Add tests for new features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED license.

## 👨‍💻 Author

[Tanavish Ali](https://github.com/tanavishali52)



## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Advanced AI model integration
- [ ] Team collaboration features
- [ ] Custom agent templates
- [ ] Webhook integrations
- [ ] API rate limiting
- [ ] Advanced analytics dashboard
- [ ] Mobile app

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Documentation](https://redux.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

---

Made with ❤️ by the Nexus AI Team
