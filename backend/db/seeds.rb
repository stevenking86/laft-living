# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data (be careful in production!)
# User.destroy_all
# Property.destroy_all

# Create or find properties
meadows = Property.find_or_create_by!(name: "The Meadows") do |p|
  p.address = "123 Meadow Lane, Springfield, IL 62701"
  p.office_hours = "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
  p.pets_allowed = true
  p.has_parking = true
end

cassidy = Property.find_or_create_by!(name: "Cassidy South") do |p|
  p.address = "456 South Street, Springfield, IL 62702"
  p.office_hours = "Monday-Friday: 8AM-7PM, Saturday: 9AM-5PM"
  p.pets_allowed = false
  p.has_parking = true
end

# Create sample resident users
User.find_or_create_by!(email: "john@example.com") do |u|
  u.role = nil # resident (default)
end

User.find_or_create_by!(email: "jane@example.com") do |u|
  u.role = nil # resident (default)
end

User.find_or_create_by!(email: "bob@example.com") do |u|
  u.role = nil # resident (default)
end

# Create property admin users
property_admin1 = User.find_or_create_by!(email: "admin@meadows.com") do |u|
  u.role = 'property_admin'
end

property_admin2 = User.find_or_create_by!(email: "admin@cassidy.com") do |u|
  u.role = 'property_admin'
end

# Create maintenance users
maintenance1 = User.find_or_create_by!(email: "maintenance@meadows.com") do |u|
  u.role = 'maintenance'
end

maintenance2 = User.find_or_create_by!(email: "maintenance@cassidy.com") do |u|
  u.role = 'maintenance'
end

# Create super admin
super_admin = User.find_or_create_by!(email: "superadmin@example.com") do |u|
  u.role = 'super_admin'
end

# Assign property admins to properties
UserProperty.find_or_create_by!(user: property_admin1, property: meadows)
UserProperty.find_or_create_by!(user: property_admin2, property: cassidy)

# Assign maintenance users to properties
UserProperty.find_or_create_by!(user: maintenance1, property: meadows)
UserProperty.find_or_create_by!(user: maintenance2, property: cassidy)

# Create sample maintenance requests if properties have units
if meadows.units.any?
  resident = User.find_by(email: "john@example.com")
  unit = meadows.units.first
  
  MaintenanceRequest.find_or_create_by!(
    user: resident,
    property: meadows,
    unit: unit,
    ticket_number: "MR-1001"
  ) do |mr|
    mr.category = "Plumbing"
    mr.description = "Leaky faucet in kitchen sink"
    mr.preferred_entry_time = "Morning, 9AM-12PM"
    mr.resident_must_be_home = true
    mr.urgency_level = "Routine"
    mr.status = "Submitted"
  end
end

if cassidy.units.any?
  resident = User.find_by(email: "jane@example.com")
  unit = cassidy.units.first
  
  MaintenanceRequest.find_or_create_by!(
    user: resident,
    property: cassidy,
    unit: unit,
    ticket_number: "MR-1002"
  ) do |mr|
    mr.category = "Electrical"
    mr.description = "Light switch not working in bedroom"
    mr.preferred_entry_time = "Afternoon, 2PM-5PM"
    mr.resident_must_be_home = false
    mr.urgency_level = "Urgent"
    mr.status = "Scheduled"
  end
end

puts "Seeded #{User.count} users"
puts "Seeded #{Property.count} properties"
puts "Seeded #{UserProperty.count} user-property associations"
puts "Seeded #{MaintenanceRequest.count} maintenance requests"
