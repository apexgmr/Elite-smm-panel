# Elite SMM Panel

A professional, full-stack Social Media Marketing (SMM) panel built with React, Express, and Firebase.

## Features

- **User Panel**: Dashboard, service browsing, order placement, order history, add funds (dummy), support tickets.
- **Admin Panel**: Statistics, service management (CRUD), user management (balance, status), order management, payment requests.
- **API System**: Users can automate orders using their API key (UID).
- **Modern UI**: Built with shadcn/ui and Tailwind CSS with a clean, dark-themed admin layout.
- **Firebase Integration**: Secure Firestore database and Firebase Authentication.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React.
- **Backend**: Node.js with Express (API endpoints, provider mocks).
- **Database**: Firebase Firestore.
- **Auth**: Firebase Authentication (Email/Google).

## Setup & Installation

1. **Environment Variables**: Ensure `.env` is configured (handled automatically in this environment).
2. **Install Dependencies**: Run `npm install` (handled automatically).
3. **Database Setup**: 
   - Firebase is already provisioned for this app.
   - Go to Admin Panel -> Dashboard and click **Seed Services** to populate sample data.
4. **Development**: Run `npm run dev` to start the Express server and Vite middleware.
5. **Production**: Run `npm run build` then `npm start`.

## Dummy Data & Testing

- **Seeding**: Navigate to the Admin Dashboard and click "Seed Services" to add sample Instagram, YouTube, and Telegram services.
- **Admin Access**: Currently, any user who registers can be made an admin by manually updating their `role` to `admin` in the Firestore `users` collection. For safety, you should initialize your first admin account this way.
- **Payments**: The "Add Funds" section uses a dummy gateway. Success adds balance directly to your account.

## Folders

- `src/components`: UI components and layouts.
- `src/lib`: Firebase config, Auth context, and database services.
- `src/pages`: User and Admin dashboard pages.
- `server.ts`: Express backend handling API calls and serving the app.
