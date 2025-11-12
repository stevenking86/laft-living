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

## Next Steps

- Add authentication (JWT, Devise, etc.)
- Implement user registration and login
- Add form validation
- Set up testing (RSpec for Rails, Jest for Next.js)
- Add error handling and loading states
- Deploy to production (Heroku, Vercel, etc.)

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
