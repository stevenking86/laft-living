# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data
User.destroy_all
Post.destroy_all

# Create sample users
users = User.create!([
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
  { name: "Bob Johnson", email: "bob@example.com" }
])

# Create sample posts
Post.create!([
  { title: "Welcome to our blog!", content: "This is our first post. We're excited to share our thoughts with you.", user: users[0] },
  { title: "Getting Started with Rails", content: "Rails is a powerful web framework for Ruby. Here's how to get started.", user: users[1] },
  { title: "Next.js Best Practices", content: "Next.js is a React framework that makes building web applications easier.", user: users[2] },
  { title: "Full-Stack Development", content: "Combining Rails and Next.js creates a powerful full-stack application.", user: users[0] },
  { title: "API Design", content: "Good API design is crucial for building scalable applications.", user: users[1] }
])

puts "Seeded #{User.count} users and #{Post.count} posts"
