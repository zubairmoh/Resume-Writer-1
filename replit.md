# ProResumes.ca - Professional Resume Writing Platform

## Overview

ProResumes.ca is a professional resume writing service platform targeting the Canadian market. The application provides an end-to-end solution for resume writing services, including an ATS (Applicant Tracking System) scanner for lead generation, tiered pricing packages, client dashboards for order management, writer portals for service delivery, and a comprehensive admin panel for business operations.

The platform follows a client-server architecture with a React frontend and Express.js backend, using PostgreSQL for data persistence. It supports three user roles: clients (customers), writers (service providers), and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (new-york style)
- **State Management**: 
  - React Query (@tanstack/react-query) for server state and caching
  - React Context (AppProvider, AuthProvider) for client-side state
- **Routing**: React Router DOM for client-side navigation
- **Animations**: Framer Motion for UI animations
- **PDF Processing**: pdfjs-dist for client-side PDF parsing in the ATS scanner

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Local Strategy, session-based auth using express-session
- **Password Hashing**: bcryptjs for secure password storage
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - contains all table definitions
- **Key Tables**:
  - `users` - User accounts with role-based access (client/writer/admin)
  - `leads` - Captured leads from ATS scanner with email, score, and status
  - `orders` - Service orders with package type, pricing, status tracking, and price override fields
  - `messages` - Communication between users tied to orders
  - `documents` - File references for uploaded resumes and deliverables
  - `adminSettings` - Platform configuration (payment keys, business info, SMTP email settings)
  - `addons` - Add-on services that can be attached to orders
  - `orderAddons` - Junction table linking orders to purchased add-ons

### API Structure
- RESTful API endpoints under `/api` prefix
- Authentication endpoints: `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/me`
- CRUD endpoints for leads, orders, messages, documents, and admin settings
- Admin endpoints: `/api/admin/users`, `/api/admin/users/:id/role` for user management
- Add-ons endpoints: `/api/addons` for CRUD operations
- Price override: `/api/orders/:id/override` for custom pricing
- Role-based access control middleware for protected routes

### Admin Panel Features
- **Order Management**: View and assign orders to writers, track status
- **Lead Management**: Track ATS scanner leads, assign to writers
- **Client Management**: View all clients, their orders and spending
- **Writer Management**: Add/edit writers, view assignments
- **User Roles**: Promote/demote users between client, writer, and admin roles
- **Chat Logs**: View message history for any order
- **Financial Tracking**: Escrow ledger, payment release
- **Settings**: Payment gateways (Stripe/PayPal), business info, SMTP email, browse notifications

### Build Configuration
- Development: Vite dev server with HMR, proxied API calls to Express backend
- Production: Vite builds static assets to `dist/public`, Express serves them
- Path aliases configured: `@/` for client source, `@shared/` for shared code, `@assets/` for attached assets

## External Dependencies

### Third-Party Services (Configured via Admin Settings)
- **Stripe**: Payment processing (publishable key and secret key stored in adminSettings)
- **PayPal**: Alternative payment option (client ID and secret stored in adminSettings)

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `/migrations` directory

### Key NPM Packages
- **UI Components**: Radix UI primitives (dialog, dropdown, tabs, toast, etc.)
- **Form Handling**: react-hook-form with @hookform/resolvers and zod validation
- **Date Handling**: date-fns
- **PDF Parsing**: pdfjs-dist (client-side resume text extraction)
- **File Upload**: react-dropzone for drag-and-drop file handling

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption (defaults to dev value if not set)