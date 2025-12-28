# Inventory Management System - Frontend

Next.js 15 frontend application for the Inventory Management System.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** - Component library
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client

## Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment Variables**
   Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start Development Server**

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Features

### Dashboard (`/`)

- Overview statistics cards:
  - Total Stock Value
  - Low Stock Items
  - Critical Stock
  - Dead Stock (with frozen capital value)
  - Out of Stock Count
  - Total Products/SKUs
- Quick action links

### Inventory Management (`/inventory`)

- View all inventory items in a table
- Search by SKU or product name
- Filter by category and status
- Status badges (Safe, Low, Critical, Out of Stock, Dead Stock)
- Link to add new products

### Add New Product (`/inventory/new`)

- Form to create new product and inventory entry
- Fields: name, SKU, category, prices, supplier, threshold, quantity, location

### Orders Management (`/orders`)

- View all pending purchase orders
- Mark orders as received (reconciliation)
- Automatic inventory update on reconciliation

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard page
│   ├── inventory/         # Inventory routes
│   │   ├── page.tsx       # Inventory list
│   │   └── new/           # Add new product
│   ├── orders/            # Orders routes
│   │   └── page.tsx       # Pending orders
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # React Query provider
├── components/
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── api.ts             # API client and types
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## API Integration

The frontend communicates with the backend API running on `http://localhost:5000/api`.

Make sure the backend server is running before starting the frontend:

```bash
# In the root directory
npm run dev
```

## Development

- **Run Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Start Production**: `npm start`
- **Lint**: `npm run lint`

## Notes

- Ensure the backend server is running on port 5000
- Suppliers need to be created via Prisma Studio before adding products
- All API calls use TanStack Query for caching and automatic refetching
