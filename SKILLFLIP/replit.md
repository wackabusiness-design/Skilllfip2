# SkillFlip - Local Skills Marketplace

## Overview

SkillFlip is a peer-to-peer skills marketplace that connects learners with local creators for personalized skill-sharing sessions. The platform allows users to discover, book, and learn new skills from experts in their community across various categories like arts, fitness, cooking, technology, and music. The application features user authentication, skill listings, booking management, event hosting ("Flip Nights"), and payment processing with creator payouts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Framework**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with structured error handling
- **File Structure**: Monorepo with shared schema between client and server

### Database Design
- **Primary Database**: PostgreSQL (via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**:
  - Users (with role-based access: learner/creator/admin)
  - Skills with categories, pricing, and media
  - Bookings with session scheduling
  - Reviews and ratings system
  - Events for community "Flip Nights"
  - Creator availability management

### Authentication & Authorization
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed express sessions
- **Role-Based Access**: Three user roles (learner, creator, admin)
- **Security**: HTTP-only cookies, CSRF protection, secure session configuration

### Payment Integration
- **Payment Processor**: Stripe integration (frontend components ready)
- **Architecture**: Prepared for Stripe Connect for creator payouts
- **Revenue Model**: Platform fee structure (mentioned 25% in documentation)

### UI/UX Architecture
- **Design System**: Shadcn/ui components with New York style
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Theme Support**: CSS custom properties for light/dark themes
- **Component Structure**: Atomic design with reusable UI components
- **Navigation**: Conditional routing based on authentication state

### Development Workflow
- **Type Safety**: Full TypeScript implementation across stack
- **Code Organization**: Barrel exports and path aliases for clean imports
- **Development Tools**: Hot reload with Vite, TypeScript checking
- **Error Handling**: Centralized error boundaries and toast notifications

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **express**: Web server framework
- **react**: Frontend library
- **@tanstack/react-query**: Server state management

### Authentication
- **openid-client**: OIDC authentication
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

### UI & Styling
- **@radix-ui/***: Primitive UI components (20+ packages)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Payment Processing
- **@stripe/stripe-js**: Stripe JavaScript SDK
- **@stripe/react-stripe-js**: React Stripe components

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **@replit/vite-plugin-***: Replit-specific development plugins
- **esbuild**: Server-side bundling for production

### Form Handling & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation library

### Date & Time
- **date-fns**: Date manipulation utilities
- **react-day-picker**: Calendar component

### Utilities
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging
- **memoizee**: Function memoization