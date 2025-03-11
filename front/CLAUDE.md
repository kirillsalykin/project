# CLAUDE.md - Project Guidelines

## Commands
- `npm run dev` or `npm start` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## Code Style
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components/interfaces, camelCase for variables/functions
- **Imports**: React first, libraries next, local modules last, CSS at end
- **Structure**: Component files match component names (e.g., Root.tsx)

## Technologies
- React 19 (functional components with hooks)
- TypeScript 5.8+
- Vite 6+ as build tool
- TailwindCSS 4.0+ for styling
- React Router 7+ for navigation
- Context API for auth state management

## Authentication
- Use email "kirill.salykin@gmail.com" with any password
- Token is stored in localStorage