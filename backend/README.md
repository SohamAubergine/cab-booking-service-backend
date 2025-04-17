# Fitness Class Booking System API

A RESTful API for managing fitness class bookings, built with Node.js, TypeScript, Express, and Prisma ORM.

## Features

- User authentication and authorization
- Fitness class management
- Booking management
- Role-based access control (User, Instructor, Admin)
- CORS support for cross-origin requests from frontend applications

## Tech Stack

- Node.js (v22 LTS)
- TypeScript (with strict mode)
- Express.js
- Prisma ORM
- PostgreSQL
- JWT for authentication

## Project Setup

### Prerequisites

- Node.js (v22 LTS)
- PostgreSQL

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/fitness_booking_db"
PORT=3000
JWT_SECRET="your-secret-key"
CORS_ORIGIN="http://localhost:3000,https://yourfrontend.com"  # Comma-separated origins, or use * for all origins
```

### Installation

```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Build the project
npm run build

# Start the server
npm start
```

### Development

```bash
# Run in development mode
npm run dev
```

### Seeding the Database

```bash
# Seed the database with initial data (fitness class categories)
npm run seed
```

## API Documentation

A Postman collection is included in the project root (`postman_collection.json`). Import this into Postman to test the API endpoints.

### Available Endpoints

#### Health Check

- `GET /api/v1/health` - Check if the API is running

#### Authentication

- `POST /api/v1/auth/register` - Register a new user
  - Only USER and INSTRUCTOR roles are allowed for public registration
  - ADMIN accounts cannot be created through public registration
- `POST /api/v1/auth/login` - Login a user

#### Fitness Classes (User)

- `GET /api/v1/fitness-classes` - Get available fitness classes with filtering and pagination
  - Only shows classes that start more than 1 hour from now
  - Excludes classes already booked by the current user
  - Returns capacity and current booking count information
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
    - `name` - Filter by class name
    - `categoryId` - Filter by category ID
    - `instructorId` - Filter by instructor ID
    - `startDateFrom` - Filter classes starting after this date
    - `startDateTo` - Filter classes starting before this date
- `GET /api/v1/fitness-classes/:fitnessClassId` - Get a single fitness class by ID
  - Returns detailed information about a specific fitness class
  - Includes category and instructor details
  - Shows capacity, current booking count, and available spots
- `POST /api/v1/fitness-classes/:fitnessClassId` - Book a fitness class
  - Only allows booking classes that start more than 1 hour from now
  - Booking fails if the class is already at full capacity
  - Uses authenticated user's ID for booking

#### Categories

- `GET /api/v1/categories` - Get all fitness class categories with pagination
  - Returns category ID, name, and description
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)

#### User Management

- `GET /api/v1/users/:userId` - Get user details by ID
  - Requires authentication
  - Users can only access their own profile unless they are admins
  - Returns user data without the password

#### User Bookings

- `GET /api/v1/bookings` - Get all bookings for the authenticated user with pagination
  - Requires authentication
  - Returns fitness class details with each booking
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)

#### Favorites

- `GET /api/v1/favorites` - Get all favorite classes for the authenticated user with pagination
  - Requires authentication
  - Returns fitness class details with each favorite
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
- `POST /api/v1/favorites/:fitnessClassId` - Add a fitness class to favorites
  - Requires authentication
  - Returns success message and favorite details
- `DELETE /api/v1/favorites/:fitnessClassId` - Remove a fitness class from favorites
  - Requires authentication
  - Returns success message
- `GET /api/v1/favorites/:fitnessClassId/status` - Check if a fitness class is in favorites
  - Requires authentication
  - Returns boolean indicating if the class is favorited by the user

#### Reviews

- `POST /api/v1/reviews` - Submit a review for a fitness class
  - Requires authentication
  - User must have booked the class
  - Class must have already ended
  - Request body parameters:
    - `fitnessClassId` - ID of the fitness class to review (required)
    - `rating` - Rating between 1-5 stars (required)
    - `feedback` - Text feedback (optional)
  - Only one review per user per class is allowed
- `GET /api/v1/reviews/classes/:fitnessClassId` - Get all reviews for a fitness class
  - Requires authentication
  - Returns paginated list of reviews with user details
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
- `GET /api/v1/reviews/classes/:fitnessClassId/summary` - Get rating summary for a fitness class
  - Requires authentication
  - Returns average rating and distribution of ratings
- `GET /api/v1/reviews/classes/:fitnessClassId/user` - Get the current user's review for a fitness class
  - Requires authentication
  - Returns the authenticated user's review for the specified class

#### Instructor Endpoints

- `GET /api/v1/instructors/classes` - Get all classes for which the authenticated user is an instructor
  - Requires authentication and INSTRUCTOR role
  - Returns fitness class details including booking information
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)

#### Admin Endpoints (All require ADMIN role)

- `GET /api/admin/fitness-classes` - Get all fitness classes with filtering and pagination
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
    - `name` - Filter by class name
    - `categoryId` - Filter by category ID
    - `instructorId` - Filter by instructor ID
    - `startDateFrom` - Filter classes starting after this date
    - `startDateTo` - Filter classes starting before this date
- `POST /api/admin/fitness-classes` - Create a fitness class
  - Request body parameters:
    - `name` - Class name (required)
    - `categoryId` - Category ID (required)
    - `instructorId` - Instructor ID (required)
    - `startsAt` - Start time of the class (ISO format, required)
    - `endsAt` - End time of the class (ISO format, required)
    - `capacity` - Maximum number of participants (optional, default: 20)
- `PUT /api/admin/fitness-classes/:fitnessClassId` - Update a fitness class
  - All fields are optional - only provided fields will be updated
  - If updating time or instructor, checks for scheduling conflicts
  - Request body parameters:
    - `name` - Class name (optional)
    - `categoryId` - Category ID (optional)
    - `instructorId` - Instructor ID (optional)
    - `startsAt` - Start time of the class (ISO format, optional)
    - `endsAt` - End time of the class (ISO format, optional)
    - `capacity` - Maximum number of participants (optional, must be positive)
- `DELETE /api/admin/fitness-classes/:fitnessClassId` - Delete a fitness class
  - Cannot delete classes that have active bookings
  - Returns a success message when deletion is successful
- `GET /api/admin/instructors` - Get all instructors with pagination
  - Returns instructor details including class count
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
    - `name` - Search instructors by name (optional, case-insensitive)
- `POST /api/admin/gyms` - Create a new gym
  - Requires admin role
  - Request body parameters:
    - `name` - Gym name (required)
    - `address` - Gym address (required)
    - `ownerId` - ID of the gym owner (optional, defaults to the authenticated user)
  - Returns the created gym data

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares
├── models/         # Database models
├── routes/         # API routes
│   ├── v1/         # Regular versioned routes
│   └── admin/      # Admin-only routes (no versioning)
├── schemas/        # Validation schemas
├── scripts/        # Utility scripts
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Application entry point
```

## Error Handling

The API provides meaningful error messages for various scenarios:

### Authentication Errors

- Invalid email or password
- Unauthorized access
- Invalid or missing authentication token

### Validation Errors

- Invalid data formats (e.g., dates, UUIDs)
- Missing required fields

### Booking Errors

- Class is already fully booked
- User has already booked the class
- Class starts too soon (less than 1 hour)

### Capacity Errors

- Invalid capacity value (must be a positive integer)
- Class is at full capacity when attempting to book

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error message describing the issue",
  "data": null,
  "extra": { ... } // Optional additional details
}
```
