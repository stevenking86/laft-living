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

### Posts
- `GET /api/v1/posts` - List all posts
- `GET /api/v1/posts/:id` - Get a specific post
- `POST /api/v1/posts` - Create a new post
- `PUT /api/v1/posts/:id` - Update a post
- `DELETE /api/v1/posts/:id` - Delete a post

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
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

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
