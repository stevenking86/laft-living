# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data
User.destroy_all

# Create sample users
User.create!([
  { email: "john@example.com" },
  { email: "jane@example.com" },
  { email: "bob@example.com" }
])

puts "Seeded #{User.count} users"
