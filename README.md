# 🚀 MERN Stack Template with Auth0

A modern, production-ready MERN (MongoDB, Express, React, Node.js) stack template with Auth0 authentication and a clean modern design system.

## ✨ Features

### 🔐 Authentication
- **Auth0 Integration**: Complete JWT-based authentication system
- **Auto User Creation**: Automatic user creation on first login
- **Protected Routes**: Ready-to-use protected route components
- **Token Management**: Automatic token refresh and validation
- **Role-Based Access**: User roles system (admin, user)

### 🎨 Design System
- **Modern Design**: Clean, simple design with blue theme
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Framer Motion**: Smooth animations and transitions
- **Responsive**: Mobile-first responsive design
- **Atomic Design**: Organized component structure (Atoms, Molecules, Organisms)
- **Design Documentation**: Comprehensive design system guide included

### 🛠️ Tech Stack

#### Frontend
- **React 19** with TypeScript
- **Vite**: Lightning-fast development server
- **React Router v7**: Modern routing solution
- **Redux Toolkit**: State management
- **TanStack Query**: Server state management
- **Axios**: HTTP client
- **React Hot Toast**: Beautiful notifications

#### Backend
- **Node.js** with Express 5
- **TypeScript**: Type-safe backend code
- **MongoDB**: NoSQL database with Mongoose ODM
- **Zod**: Runtime type validation
- **Express Rate Limit**: API rate limiting
- **Morgan**: HTTP request logger
- **CORS**: Cross-origin resource sharing

### 🔒 Security Features
- JWT token validation with Auth0
- Rate limiting (10,000 requests per 15 minutes)
- CORS configuration
- Environment variable validation
- Comprehensive error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Auth0 account (free tier available)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/LironeFitoussi/mern-ts-tempalte-2.git
cd mern-ts-tempalte-2
```

### 2. Setup Auth0

1. Create a free Auth0 account at [auth0.com](https://auth0.com)
2. Create a new **Application** (Single Page Application)
3. Create a new **API** in Auth0 dashboard
4. Note down:
   - Domain
   - Client ID (from Application)
   - Audience (API Identifier from API settings)

### 3. Automated Setup (Recommended)

Run the boot command from the project root to automatically:
- Create `.env` files from `.env.example` templates
- Install all dependencies for both Server and Client

```bash
npm run boot
```

After the boot process completes, edit the `.env` files with your actual values:
- `Server/.env` - Add your MongoDB URI and Auth0 credentials
- `Client/.env` - Add your Auth0 credentials

### 4. Manual Setup (Alternative)

If you prefer manual setup:

#### Server Setup
```bash
cd Server
npm install
```

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

#### Client Setup
```bash
cd Client
npm install
```

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 5. Start Development Servers

**Server:**
```bash
cd Server
npm run dev
```

**Client:**
```bash
cd Client
npm run dev
```

### 6. Configure Auth0 Callbacks

In your Auth0 Application settings, add:
- **Allowed Callback URLs**: `http://localhost:5173`
- **Allowed Logout URLs**: `http://localhost:5173`
- **Allowed Web Origins**: `http://localhost:5173`

## 🐳 Docker Setup (Recommended)

This project includes a complete Docker setup with hot reload for development and production-ready configurations.

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)
- `.env` file at project root (see `.env.example`)

### Quick Start with Docker

1. **Create `.env` file** (REQUIRED):
   ```bash
   cp .env.example .env
   ```
   
   **Important**: Edit `.env` and fill in your Auth0 credentials:
   - `AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-tenant.auth0.com`)
   - `AUTH0_AUDIENCE` - Your API identifier (e.g., `https://your-api`)
   - `AUTH0_CLIENT_ID` - Your Auth0 application client ID
   - `AUTH0_CLIENT_SECRET` - Your Auth0 machine-to-machine client secret
   - `VITE_AUTH0_DOMAIN` - Same as AUTH0_DOMAIN
   - `VITE_AUTH0_CLIENT_ID` - Same as AUTH0_CLIENT_ID
   - `VITE_AUTH0_AUDIENCE` - Same as AUTH0_AUDIENCE
   
   Without these, the server will fail to start!

   **Note**: If you see "MongoDB Authentication failed" error, reset MongoDB:
   ```bash
   npm run reset:mongodb
   npm run dev
   ```

2. **Start development** (shows live logs from all containers):
   ```bash
   npm run dev
   ```
   
   Or run in detached mode (background):
   ```bash
   npm run dev:detached
   ```

3. **Start production**:
   ```bash
   npm run start
   ```

4. **Stop services**:
   ```bash
   npm run stop
   ```

5. **View logs**:
   ```bash
   npm run logs
   ```

### Access Services
- Client: http://localhost:5173
- Server: http://localhost:3000
- MongoDB: localhost:27017

📖 **See [DOCKER.md](./docs/DOCKER.md) for detailed Docker documentation**

### Docker Features
- ✅ Hot reload in development (code changes reflect immediately)
- ✅ Reverse proxy for API requests (no CORS issues)
- ✅ Isolated Docker networks
- ✅ Persistent data volumes
- ✅ Health checks for all services
- ✅ Production-ready multi-stage builds

## 📁 Project Structure

```
mern-ts-tempalte-2/
├── Client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Base UI components (shadcn)
│   │   │   ├── Atoms/      # Atomic design components
│   │   │   ├── Molecules/  # Molecular components
│   │   │   ├── Organism/   # Organism components
│   │   │   ├── AppInitializer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── main.tsx        # Entry point
│   └── docs/               # Documentation files
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── Server/                  # Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── zod/            # Zod validation schemas
│   │   └── server.ts       # Entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── scripts/                 # Root-level automation scripts
│   ├── boot.js             # Automated setup script
│   └── build.js            # Build script for both projects
├── package.json            # Root package.json with convenience scripts
└── README.md               # This file
```

## 🎯 Available Scripts

### Root Level (Project Root)
- `npm run boot` - **Automated setup**: Creates `.env` files from templates and installs all dependencies
- `npm run build` - Build both Server and Client for production (runs in parallel)
- `npm run install:all` - Install dependencies for both Server and Client
- `npm run dev` - Start Docker development environment
- `npm run start` - Start Docker production environment
- `npm run stop` - Stop Docker services
- `npm run logs` - View Docker logs

### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Key Components

### AppInitializer
Handles automatic user initialization:
- Fetches Auth0 token on login
- Sets API authorization headers
- Creates user in database if not exists
- Manages user state in Redux

### ProtectedRoute
Wrapper component for protected pages:
```tsx
<ProtectedRoute requiredRole="admin">
  <YourComponent />
</ProtectedRoute>
```

### Error Handling
Comprehensive error handling system:
- Mongoose errors (validation, cast, duplicate key)
- Zod validation errors
- Custom AppError class
- Development-friendly error messages

## 🎨 Design System

The template includes a comprehensive modern design system:

- **Clean Design**: Simple, modern interface with blue theme
- **Consistent Colors**: Predefined color palette with light and dark blue variants
- **Typography**: Clear hierarchy using Figtree font
- **Animations**: Smooth transitions with Framer Motion
- **Components**: Ready-to-use UI components following atomic design principles
- **Loading States**: Unified loading spinner component

See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for complete design guidelines.

## 🔧 Customization Guide

### 1. Update Branding
- Replace "YourApp" in `Header.tsx` and `Footer.tsx`
- Update page titles and meta tags
- Add your logo

### 2. Extend User Model
Edit `Server/src/models/userModel.ts`:
```typescript
const userSchema = new Schema<IUserDoc>({
  // Add your custom fields
  customField: { type: String, required: false },
});
```

### 3. Add New Routes

#### Backend
1. Create controller in `Server/src/controllers/`
2. Create route in `Server/src/routes/`
3. Add Zod validation in `Server/src/zod/`
4. Register route in `Server/src/server.ts`

#### Frontend
1. Create page component in `Client/src/pages/`
2. Add route in `Client/src/routes.tsx`
3. Create API service in `Client/src/services/`

### 4. Add New UI Components
Follow the atomic design structure:
- **Atoms**: Basic building blocks (buttons, inputs)
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex components (header, forms)

## 🚦 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/validate` - Validate JWT token (protected)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Server health check
- `GET /danger/db-health` - Database health (dev only)

## 🐛 Troubleshooting

### Common Issues

**Auth0 Login Redirect Not Working**
- Check callback URLs in Auth0 dashboard
- Verify environment variables are correct
- Ensure Auth0 domain doesn't have `https://` prefix

**CORS Errors**
- Check `CLIENT_URL` in server `.env`
- Verify CORS configuration in `server.ts`

**Database Connection Failed**
- Check MongoDB is running
- Verify `MONGO_URI` in server `.env`
- Check network connectivity

**Token Validation Failed**
- Verify `AUTH0_AUDIENCE` matches in both client and server
- Check token hasn't expired
- Ensure Auth0 API is configured correctly

## 📚 Learn More

### Documentation
- [Auth0 Documentation](https://auth0.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)

### Design Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)

## 🤝 Contributing

This is a template repository. Feel free to:
- Fork and modify for your projects
- Report issues or bugs
- Suggest improvements
- Share your creations

## 📝 License

ISC - Feel free to use this template for any purpose.

## 🎉 Credits

Built with ❤️ using:
- React, Express, MongoDB, Node.js
- Auth0 for authentication
- Tailwind CSS for styling
- And many other amazing open-source tools

---

**Happy coding! 🚀**

For questions or support, please open an issue on GitHub.

