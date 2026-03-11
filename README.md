# Leet-Prep

A comprehensive LeetCode problem tracker and management platform. Browse, filter, and organize coding problems by difficulty and company with an intuitive interface...

<!-- https://docs.google.com/document/d/1YSged3VvphpvZ7O0gXoBQHKgLebvTlB7aKUhkXPG9nc/edit?usp=sharing -->

- [Google Search Console](https://search.google.com/search-console/about)
- [Google Analytics](https://analytics.google.com/)
- [Uptime Robot](https://uptimerobot.com/)
- [Uptime Robot status page](https://stats.uptimerobot.com/7eMGHnTOdp)
- [Upstash Redis](https://console.upstash.com/redis/5c5fd3c1-cfcd-4baf-8236-75b5a48688ae/details?teamid=0)

## Architecture:
 <img width="446" height="428" alt="image" align="" src="https://github.com/user-attachments/assets/e90b4a36-d930-4b50-9da3-eec15f6c8082" />
 
## A Glimpse
<img width="1600" height="900" alt="image" src="/frontend/public/landing2.png" />
<img alt="image" src="/frontend/public/dashboard.png" />

Note - Works on Chrome, Edge, Brave, Opera, safari

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)

## A video Glimps: https://youtu.be/pjmTMAH-M3I
[![Leet-Prep Platform Introduction](https://img.youtube.com/vi/EG__AujR-tQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=EG__AujR-tQ)
## Features

- Browse 2200+ LeetCode problems in a responsive data table
- Filter problems by difficulty (Easy, Medium, Hard)
- Filter problems by company tags
- Search problems by title
- Sort and organize columns
- Client-side pagination (30 problems per page)
- Razorpay integration using webhooks
- Final 450 Lova Babbar sheet
- Google OAuth authentication
- Clean, modern UI built with shadcn/ui components
- Responsive design with collapsible sidebar
- have to brave, opera browser

## Tech Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose ODM
- Passport.js for Google OAuth authentication
- JWT for session management
- Helmet for security headers
- CORS enabled
- Redis + BullMQ for job queues

### Frontend

- React 19.2.0
- Vite 7.2.4 for build tooling
- Tailwind CSS 4.1.18 for styling
- shadcn/ui component library
- TanStack Table for data grid
- Axios for API calls
- React Router for navigation
- Lucide React for icons

## Project Structure

```
Leet.IO/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Custom middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   ├── index.js        # Entry point
│   │   └── server.js       # Express server setup
│   ├── scripts/            # Database seeding scripts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   │   ├── ui/        # shadcn/ui components
    │   │   ├── DataTable.jsx
    │   │   ├── columns.jsx
    │   │   ├── Navbar.jsx
    │   │   └── layout.jsx
    │   ├── pages/         # Page components
    │   │   ├── Dashboard.jsx
    │   │   └── Login.jsx
    │   ├── lib/           # Utilities
    │   │   ├── api.js     # API client
    │   │   └── utils.js   # Helper functions
    │   └── hooks/         # Custom React hooks
    ├── public/
    └── package.json
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Additional Resources.

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Table Docs](https://tanstack.com/table/latest)

## License

This project is licensed under the ISC License.

