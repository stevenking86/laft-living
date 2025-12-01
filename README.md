# Rails + Next.js Full-Stack Application

A modern full-stack application with a Rails API backend and Next.js frontend.

## Project Structure

```
laft/
├── backend/          # Rails API (Ruby)
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/v1/
│   │   └── models/
│   ├── config/
│   ├── db/
│   └── Gemfile
├── frontend/         # Next.js App (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   ├── lib/
│   │   └── config/
│   └── package.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby 3.2+** (with rbenv or rvm)
- **Node.js 18+** and npm
- **PostgreSQL**
- **Git**

## Setup Instructions

### 1. Ruby Environment Setup

If you don't have Ruby 3.2+ installed, use rbenv:

```bash
# Install rbenv (if not already installed)
brew install rbenv ruby-build

# Add rbenv to your shell
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc

# Install Ruby 3.2.0
rbenv install 3.2.0
rbenv global 3.2.0
```

### 2. Backend Setup (Rails API)

```bash
cd backend

# Install dependencies
bundle install

# Setup database
rails db:create
rails db:migrate

# Seed database (optional)
rails db:seed

# Start the Rails server
rails server -p 3001
```

The Rails API will be available at `http://localhost:3001`

### 3. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The Next.js app will be available at `http://localhost:3000`

## API Endpoints

The Rails API provides the following endpoints:

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get a specific user
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Rental Applications
- `POST /api/v1/rental_applications` - Create a new rental application
- `GET /api/v1/rental_applications/:id` - Get a specific rental application

### Verifications
- `POST /api/v1/rental_applications/:rental_application_id/verifications` - Upload ID image for verification
- `GET /api/v1/rental_applications/:rental_application_id/verifications/show_by_application` - Get verification status
- `GET /api/v1/rental_applications/:rental_application_id/verifications/:id` - Get specific verification
- `POST /api/v1/rental_applications/:rental_application_id/verifications/:id/verify` - Manually trigger verification


## Development

### Running Both Servers

You'll need to run both servers simultaneously:

**Terminal 1 (Rails API):**
```bash
cd backend
rails server -p 3001
```

**Terminal 2 (Next.js Frontend):**
```bash
cd frontend
npm run dev
```

### Database Management

```bash
# Create database
rails db:create

# Run migrations
rails db:migrate

# Reset database
rails db:drop db:create db:migrate

# Seed database
rails db:seed
```

## Seed Data & Demo Scenarios

The seed file (`backend/db/seeds.rb`) creates comprehensive test data for 7 demo scenarios. This section documents all available test users and their use cases.

**Important:** The demo date is **December 5, 2024**. All dates in the seed data are relative to this date.

### Overview

The seed file creates:
- **2 Properties**: The Meadows and Cassidy South
- **7 Units**: Multiple units across both properties with pricing
- **7 Test Users**: Covering various roles and lease scenarios
- **Leases, Payments, and Relationships**: Complete data for each scenario

### Test Users & Scenarios

**All test users have the same password for easy demo access:** `Password123!`

#### 1. Pre-Move-In User
**Email:** `pre_movein_user@example.com`  
**Password:** `Password123!`  
**Role:** Resident  
**Property:** The Meadows, Unit 101  
**Monthly Rent:** $1,200.00

**Scenario Details:**
- Has an approved rental application
- Has a signed lease with `move_in_date` of **January 15, 2025** (future date)
- Lease was signed on November 20, 2024
- **No payments created** - they haven't moved in yet

**Demo Use Cases:**
- Show upcoming lease information
- Display lease details before move-in
- Demonstrate lease signing workflow

---

#### 2. Moved-In User Who Owes Rent
**Email:** `moved_in_user@example.com`  
**Password:** `Password123!`  
**Role:** Resident  
**Property:** The Meadows, Unit 102  
**Monthly Rent:** $1,250.00

**Scenario Details:**
- Moved in on **November 1, 2024**
- Lease signed on October 15, 2024
- **Loyalty Tier:** Bronze (new resident)
- **Payment Status:** 
  - December 2024 payment: **Pending** (not paid)
  - Amount due: $1,250.00

**Demo Use Cases:**
- Show outstanding rent payment
- Demonstrate payment flow
- Display resident dashboard with pending payments
- Show payment history (none yet)

---

#### 3. Loyalty Tier User (Gold) Who Owes Rent
**Email:** `loyalty_user@example.com`  
**Password:** `Password123!`  
**Role:** Resident  
**Property:** The Meadows, Unit 201  
**Monthly Rent:** $1,300.00  
**Loyalty Tier:** **Gold** (5% discount)

**Scenario Details:**
- Moved in on **May 1, 2024**
- Has made **6 on-time payments** (June, July, August, September, October, November 2024)
- All previous payments were paid on the 5th of each month (on time - before the 10th deadline)
- **Payment Status:**
  - December 2024 payment: **Pending** (not paid)
  - Original amount: $1,300.00
  - **Discounted amount:** $1,235.00 (5% discount applied)

**Demo Use Cases:**
- Show loyalty tier benefits (Gold tier with 5% discount)
- Demonstrate discount calculation on rent payments
- Display payment history showing consistent on-time payments
- Show how loyalty tier is calculated (6+ on-time payments = Gold)
- Highlight the discount applied to outstanding payments

**Key Features to Showcase:**
- Loyalty tier badge/indicator
- Discount percentage display
- Original vs. discounted payment amount
- Payment history showing on-time payments

---

#### 4. User with 2 Overlapping Active Leases
**Email:** `dual_lease_user@example.com`  
**Password:** `Password123!`  
**Role:** Resident  
**Properties:** The Meadows (Unit 202) and Cassidy South (Unit A1)  
**Monthly Rents:** $1,350.00 and $1,100.00

**Scenario Details:**
- **Lease 1 (The Meadows):**
  - Moved in: September 1, 2024
  - Unit: 202
  - Payments: October (paid), November (paid), December (pending)
- **Lease 2 (Cassidy South):**
  - Moved in: October 15, 2024 (overlaps with first lease)
  - Unit: A1
  - Payments: November (paid), December (pending)
- Both leases are active and overlapping
- **Loyalty Tier:** Bronze at both properties

**Demo Use Cases:**
- Show user with multiple active leases
- Display leases across different properties
- Show payments due for multiple leases
- Demonstrate lease management for multi-property residents
- Show total amount owed across all leases

**Key Features to Showcase:**
- Multiple lease cards/listings
- Separate payment tracking per lease
- Property-specific loyalty tiers
- Total outstanding balance across all leases

---

#### 5. Maintenance User
**Email:** `maintenance@demo.com`  
**Password:** `Password123!`  
**Role:** Maintenance  
**Assigned Property:** The Meadows

**Scenario Details:**
- Assigned to The Meadows property
- Can view and manage maintenance requests for assigned property
- Has access to maintenance dashboard

**Demo Use Cases:**
- Show maintenance dashboard
- Display maintenance requests for the property
- Demonstrate maintenance request assignment
- Show maintenance user workflow

---

#### 6. Property Admin
**Email:** `admin@demo.com`  
**Password:** `Password123!`  
**Role:** Property Admin  
**Assigned Property:** The Meadows

**Scenario Details:**
- Assigned to The Meadows property (same as maintenance user)
- Can view property management dashboard
- Has access to property admin features

**Demo Use Cases:**
- Show property admin dashboard
- Display property overview and statistics
- Demonstrate property management features
- Show admin user workflow

---

#### 7. Super Admin
**Email:** `superadmin@demo.com`  
**Password:** `Password123!`  
**Role:** Super Admin

**Scenario Details:**
- No property assignment needed
- Can access **all properties** in the system
- Has access to both property admin and maintenance dashboards
- Full system access

**Demo Use Cases:**
- Show super admin dashboard
- Demonstrate access to all properties
- Show system-wide statistics
- Display admin capabilities across multiple properties

---

### Loyalty Tier System

The loyalty tier system rewards residents for on-time payments:

- **Bronze** (Default): 0% discount
- **Silver**: 3% discount (requires 3+ on-time payments, no unpaid late payments)
- **Gold**: 5% discount (requires 6+ on-time payments, no unpaid late payments)

**On-Time Payment Definition:**
- Payment must be marked as `paid` with a `paid_date` on or before the 10th of the payment month
- Example: December payment is on-time if `paid_date` is December 1-10

**Loyalty Tier User Example:**
- `loyalty_user@example.com` has Gold tier
- Made 5 on-time payments (July-November 2024)
- December payment shows 5% discount ($1,300.00 → $1,235.00)

### Payment Status Reference

**Payment Statuses:**
- `pending`: Payment is due but not yet paid
- `paid`: Payment has been completed
- `late`: Payment is overdue (after 10th of month and not paid)

**Payment Calculation:**
- First payment is due the month **after** move-in date
- Example: Move-in on November 1 → First payment due December 1

### Demo Date Context

**Current Demo Date:** December 5, 2024

**Date Ranges in Seed Data:**
- Pre-move-in: January 15, 2025 (future)
- Recent move-ins: September-November 2024
- Historical payments: July-November 2024
- Current outstanding: December 2024 payments

### Resetting Seed Data

To reset and re-seed the database:

```bash
cd backend
rails db:drop db:create db:migrate db:seed
```

**Warning:** This will delete all existing data and recreate the seed data.

### Adding New Features

1. **Backend (Rails):**
   - Create models: `rails generate model ModelName field:type`
   - Create controllers: `rails generate controller Api::V1::ControllerName`
   - Add routes in `config/routes.rb`
   - Run migrations: `rails db:migrate`

2. **Frontend (Next.js):**
   - Add API calls in `src/lib/api.ts`
   - Create components in `src/components/`
   - Add pages in `src/app/`

## Configuration

### Environment Variables

**Backend (.env):**
```bash
DATABASE_URL=postgresql://username:password@localhost/laft_development
OPENAI_API_KEY=your_openai_api_key_here
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Getting an OpenAI API Key

The application uses OpenAI's Vision API for ID verification. To set this up:

1. **Sign up for OpenAI:**
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Create an account or sign in

2. **Create an API Key:**
   - Navigate to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (you won't be able to see it again)

3. **Add to Backend:**
   - Create a `.env` file in the `backend/` directory (if it doesn't exist)
   - Add: `OPENAI_API_KEY=sk-your-key-here`
   - **Important:** Never commit this file to version control!

4. **Alternative: Use Environment Variables:**
   ```bash
   export OPENAI_API_KEY=sk-your-key-here
   ```

**Note:** The ID verification feature requires the `gpt-4o` model, which has usage costs. Check [OpenAI's pricing](https://openai.com/pricing) for current rates.

### CORS Configuration

The Rails API is configured to allow requests from `http://localhost:3000`. To change this, update `config/initializers/cors.rb`.

## Troubleshooting

### Common Issues

1. **Ruby version issues:**
   ```bash
   rbenv versions
   rbenv global 3.2.0
   ```

2. **Database connection issues:**
   - Ensure PostgreSQL is running
   - Check database credentials in `config/database.yml`

3. **CORS issues:**
   - Verify CORS configuration in `config/initializers/cors.rb`
   - Check that frontend URL matches the allowed origins

4. **Port conflicts:**
   - Rails API runs on port 3001
   - Next.js runs on port 3000
   - Change ports if needed in respective configurations

### Getting Help

- Check the Rails logs: `tail -f log/development.log`
- Check the Next.js logs in the terminal where you ran `npm run dev`
- Verify both servers are running on the correct ports

## Features

### ID Verification

The application includes AI-powered ID verification:

1. **User Flow:**
   - After submitting a rental application, users are redirected to upload their ID
   - Users upload a photo of their government-issued ID (driver's license, passport, etc.)
   - The AI service analyzes the ID to:
     - Extract the name from the ID
     - Verify if it appears to be a valid ID
     - Compare the name on the ID with the name on the application
   - Users receive immediate feedback on verification status

2. **Technical Details:**
   - Uses OpenAI's GPT-4 Vision API for image analysis
   - Images are stored using Rails Active Storage
   - Verification results are stored in the database
   - Frontend polls for verification status updates

3. **Verification Status:**
   - `pending` - Verification in progress
   - `verified` - ID is valid and name matches
   - `failed` - ID could not be verified or name doesn't match

## Deployment

This application is configured to deploy to Railway. The configuration supports both local development and production deployment.

### Railway Deployment

#### Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub repository with your code
- Stripe account (for payments)
- OpenAI API key (for ID verification)

#### Backend Deployment

1. **Create a new Railway project:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` directory as the root

2. **Add PostgreSQL database:**
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

3. **Set environment variables:**
   - Go to your backend service → Variables
   - Add the following:
     ```
     RAILS_ENV=production
     RAILS_MASTER_KEY=<your-master-key-from-backend/config/master.key>
     FRONTEND_URL=https://your-frontend-url.railway.app
     OPENAI_API_KEY=sk-your-openai-key
     STRIPE_SECRET_KEY=sk-your-stripe-secret-key
     ACTIVE_STORAGE_SERVICE=local
     RAILS_SERVE_STATIC_FILES=true
     PORT=3000
     ```

4. **Deploy:**
   - Railway will automatically detect the Rails app and deploy
   - The `Procfile` will run migrations on deploy
   - Your backend will be available at `https://your-backend.railway.app`

5. **Seed the database (first time only):**
   - In Railway dashboard, go to your backend service
   - Open the terminal/CLI
   - Run: `rails db:seed RAILS_ENV=production`

#### Frontend Deployment

1. **Create a new Railway service:**
   - In the same Railway project, click "New"
   - Select "GitHub Repo"
   - Choose your repository
   - Select the `frontend` directory as the root

2. **Set environment variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NODE_ENV=production
   ```

3. **Deploy:**
   - Railway will automatically detect Next.js and deploy
   - Your frontend will be available at `https://your-frontend.railway.app`

4. **Update backend CORS:**
   - After frontend is deployed, update the backend `FRONTEND_URL` variable to match your frontend URL
   - Redeploy the backend

#### Alternative: Deploy Frontend to Vercel

For better Next.js optimization, you can deploy the frontend to Vercel:

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Set environment variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

3. **Deploy:**
   - Vercel will automatically deploy on every push
   - Update backend `FRONTEND_URL` to your Vercel URL

### Local Development

All configurations support local development. To run locally:

**Backend:**
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will connect to `http://localhost:3001` automatically in development.

### Environment Variables Reference

**Backend (Production):**
- `DATABASE_URL` - Auto-provided by Railway PostgreSQL
- `RAILS_ENV=production`
- `RAILS_MASTER_KEY` - From `backend/config/master.key`
- `FRONTEND_URL` - Your deployed frontend URL
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `ACTIVE_STORAGE_SERVICE=local` - Use local storage (or `amazon` for S3)
- `RAILS_SERVE_STATIC_FILES=true`
- `PORT=3000` - Railway sets this automatically

**Frontend (Production):**
- `NEXT_PUBLIC_API_URL` - Your deployed backend URL
- `NODE_ENV=production`

## Next Steps

- Add authentication (JWT, Devise, etc.)
- Implement user registration and login
- Add form validation
- Set up testing (RSpec for Rails, Jest for Next.js)
- Add error handling and loading states

## Tech Stack

**Backend:**
- Ruby on Rails 7.0 (API mode)
- PostgreSQL
- Rack CORS
- Puma web server

**Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS
- React 18

## License

This project is open source and available under the [MIT License](LICENSE).
