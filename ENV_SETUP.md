# Environment Configuration

## Setup Instructions

1. Create a `.env` file in the root directory of the project
2. Add the following environment variables:

```env
# API Configuration
VITE_API_BASE_URL=https://apiwh.ph.town/

# Development
NODE_ENV=development
```

## Environment Variables

-   `VITE_API_BASE_URL`: The base URL for the API endpoints
-   `NODE_ENV`: Environment mode (development, production, etc.)

## Default Values

If no `.env` file is found or variables are not set, the application will use these defaults:

-   `VITE_API_BASE_URL`: `https://apiwh.ph.town/`
-   `NODE_ENV`: `development`

## Production Setup

For production, update the `VITE_API_BASE_URL` to your production API URL:

```env
VITE_API_BASE_URL=https://your-production-api.com/api/
NODE_ENV=production
```
