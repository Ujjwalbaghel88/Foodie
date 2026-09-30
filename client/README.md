# Cravings

Cravings is a full-stack food ordering app built around the complete journey: discover restaurants, explore menus, place an order, and follow delivery. It also includes separate workspaces for customers, restaurant teams, riders, and administrators.

## Product highlights

- Restaurant discovery with search, cuisine filters, ratings, saved places, and location-aware browsing
- Menu browsing, cart and checkout flow, payment integration, and order tracking
- Account registration, sign-in, profile management, and order history
- Role-based dashboards for customers, restaurants, riders, and admins
- Restaurant menu and order management, delivery workflows, and admin reports
- Responsive React interface with keyboard focus states and reduced-motion support

## Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Integrations | Razorpay, Cloudinary, OpenStreetMap/Nominatim |

## Run locally

Requirements: Node.js, npm, and a MongoDB connection string.

1. Install dependencies in `client` and `server` with `npm install`.
2. Copy `server/.env.example` to `server/.env`, then set the database URL, a unique JWT secret (at least 32 characters), allowed frontend origin, and any integration credentials. Never commit secrets.
3. Start the API from `server` with `npm run dev`.
4. Start the frontend from `client` with `npm run dev`.

Set `VITE_API_BASE_URL` to the deployed API URL in the frontend hosting settings. Set `ALLOWED_ORIGINS` on the API to the frontend's exact origin. Vercel builds the frontend at the domain root; `npm run deploy` builds the `/Foodie/` path for GitHub Pages. `render.yaml` defines the API service and required secrets; MongoDB still needs a reachable hosted database.

## Project structure

```text
client/
  src/pages/          Customer-facing pages and ordering flow
  src/components/     Shared navigation, dashboards, and UI
  src/context/        Authentication state
  src/utils/          Checkout, favorites, and discovery helpers
server/
  src/controller/     API request handlers
  src/model/          MongoDB models
  src/router/         API routes
  src/middleware/     Authentication and access control
```

## Scripts

Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

Backend: `npm run dev`, `npm start`, `npm run seed`.

## Notes

Payment, maps, image hosting, email, and database features need their corresponding credentials and service configuration. Use test credentials for local development. The app is a portfolio project; production readiness depends on deployment configuration, security review, and live-service setup.
