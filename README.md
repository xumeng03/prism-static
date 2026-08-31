# Prism Static

A modern React-based web application for media management and exploration.

## Tech Stack

- **Framework**: React 19 + TypeScript 6
- **Build Tool**: Vite 8
- **State Management**: Zustand + Immer
- **Routing**: React Router DOM 7
- **UI Components**: Masonic (masonry layouts)
- **Code Highlighting**: Highlight.js
- **HTTP Client**: Axios

## Prerequisites

- Node.js 22 or higher
- npm

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Build

```bash
# Build for production
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Docker Deployment

The project includes a multi-stage Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t prism-static .

# Run the container
docker run -p 80:80 prism-static
```

The Docker image uses:
- **Build stage**: Node.js 22 Alpine for compiling TypeScript and bundling assets
- **Runtime stage**: Nginx 1.27 Alpine for serving static files

## Project Structure

```
src/
├── api/           # API client modules
├── assets/        # Static assets (images, fonts, etc.)
├── components/    # Reusable React components
├── constants/     # Application constants
├── hooks/         # Custom React hooks
├── layout/        # Layout components
├── pages/         # Page components (Album, Library, Explore, etc.)
├── routers/       # Routing configuration
├── store/         # Zustand store definitions
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Available Pages

- **Account**: User account management
- **Album**: Album viewing and management
- **Api**: API testing/documentation
- **Auth**: Authentication flows
- **Explore**: Content discovery
- **Library**: Personal library management
- **Notification**: User notifications
- **Search**: Search functionality
- **Other**: Additional features

## Nginx Configuration

The application uses a custom Nginx configuration (`nginx.conf`) that:
- Serves static files from `/usr/share/nginx/html`
- Supports client-side routing with fallback to `index.html`
- Listens on port 80

## Environment Variables

- `.env.development` - Development environment configuration
- `.env.production` - Production environment configuration

## Code Quality

```bash
# Run ESLint
npm run lint
```

## License

Private project