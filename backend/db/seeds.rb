# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Demo Date: December 5, 2024
# This seed file creates comprehensive test data for 7 demo scenarios.

# Clear existing data (be careful in production!)
puts "Clearing existing data..."
User.destroy_all
Property.destroy_all
# Note: This will cascade delete related records (leases, payments, etc.)

# ============================================================================
# PROPERTIES AND UNITS
# ============================================================================

puts "Creating properties and units..."

# Property 1: The Meadows
meadows = Property.create!(
  name: "The Meadows",
  address: "123 Meadow Lane, Springfield, IL 62701",
  office_hours: "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM",
  pets_allowed: true,
  has_parking: true
)

# Units for The Meadows
meadows_unit_1 = Unit.create!(property: meadows, name: "101")
meadows_unit_2 = Unit.create!(property: meadows, name: "102")
meadows_unit_3 = Unit.create!(property: meadows, name: "201")
meadows_unit_4 = Unit.create!(property: meadows, name: "202")

# UnitMonthlyPrice for The Meadows units (12 months term)
meadows_unit_1_price = UnitMonthlyPrice.create!(
  unit: meadows_unit_1,
  term: "12 months",
  price: 1200.00
)

meadows_unit_2_price = UnitMonthlyPrice.create!(
  unit: meadows_unit_2,
  term: "12 months",
  price: 1250.00
)

meadows_unit_3_price = UnitMonthlyPrice.create!(
  unit: meadows_unit_3,
  term: "12 months",
  price: 1300.00
)

meadows_unit_4_price = UnitMonthlyPrice.create!(
  unit: meadows_unit_4,
  term: "12 months",
  price: 1350.00
)

# Property 2: Cassidy South
cassidy = Property.create!(
  name: "Cassidy South",
  address: "456 South Street, Springfield, IL 62702",
  office_hours: "Monday-Friday: 8AM-7PM, Saturday: 9AM-5PM",
  pets_allowed: false,
  has_parking: true
)

# Units for Cassidy South
cassidy_unit_1 = Unit.create!(property: cassidy, name: "A1")
cassidy_unit_2 = Unit.create!(property: cassidy, name: "A2")
cassidy_unit_3 = Unit.create!(property: cassidy, name: "B1")

# UnitMonthlyPrice for Cassidy South units (12 months term)
cassidy_unit_1_price = UnitMonthlyPrice.create!(
  unit: cassidy_unit_1,
  term: "12 months",
  price: 1100.00
)

cassidy_unit_2_price = UnitMonthlyPrice.create!(
  unit: cassidy_unit_2,
  term: "12 months",
  price: 1150.00
)

cassidy_unit_3_price = UnitMonthlyPrice.create!(
  unit: cassidy_unit_3,
  term: "12 months",
  price: 1200.00
)

# ============================================================================
# SCENARIO 1: User with lease but hasn't moved in yet
# ============================================================================

puts "Creating Scenario 1: Pre-move-in user..."

pre_movein_user = User.create!(
  email: "pre_movein_user@example.com",
  password: "Password123!",
  role: nil # resident
)

pre_movein_app = RentalApplication.new(
  user: pre_movein_user,
  property: meadows,
  unit: meadows_unit_1,
  unit_monthly_price: meadows_unit_1_price,
  move_in_date: Date.new(2025, 1, 15), # Future date
  status: :approved,
  first_name: "Alex",
  last_name: "Johnson",
  date_of_birth: Date.new(1990, 5, 15),
  gender: "Non-binary"
)
pre_movein_app.skip_move_in_date_validation = true
pre_movein_app.save!

pre_movein_lease = Lease.create!(
  rental_application: pre_movein_app,
  property: meadows,
  unit: meadows_unit_1,
  move_in_date: Date.new(2025, 1, 15),
  signed: true,
  signed_date: Date.new(2024, 11, 20)
)

LeaseTenant.create!(
  lease: pre_movein_lease,
  user: pre_movein_user
)

# No payments created - they haven't moved in yet

# ============================================================================
# SCENARIO 2: User with lease who has moved in and owes rent
# ============================================================================

puts "Creating Scenario 2: Moved-in user who owes rent..."

moved_in_user = User.create!(
  email: "moved_in_user@example.com",
  password: "Password123!",
  role: nil # resident
)

moved_in_app = RentalApplication.new(
  user: moved_in_user,
  property: meadows,
  unit: meadows_unit_2,
  unit_monthly_price: meadows_unit_2_price,
  move_in_date: Date.new(2024, 11, 1), # Moved in November
  status: :approved,
  first_name: "Sarah",
  last_name: "Williams",
  date_of_birth: Date.new(1988, 8, 22),
  gender: "Female"
)
moved_in_app.skip_move_in_date_validation = true
moved_in_app.save!

moved_in_lease = Lease.create!(
  rental_application: moved_in_app,
  property: meadows,
  unit: meadows_unit_2,
  move_in_date: Date.new(2024, 11, 1),
  signed: true,
  signed_date: Date.new(2024, 10, 15)
)

LeaseTenant.create!(
  lease: moved_in_lease,
  user: moved_in_user
)

# Create UserProperty for loyalty tracking (will be bronze)
UserProperty.create!(
  user: moved_in_user,
  property: meadows,
  loyalty_tier: :bronze
)

# Payment for December 2024 (first payment month after move-in)
# First payment is due the month AFTER move_in_date
dec_payment = Payment.create!(
  user: moved_in_user,
  lease: moved_in_lease,
  amount: 1250.00,
  due_date: Date.new(2024, 12, 1),
  payment_month: Date.new(2024, 12, 1),
  status: :pending
)

# ============================================================================
# SCENARIO 3: User with active lease, higher loyalty tier, owes rent
# ============================================================================

puts "Creating Scenario 3: Loyalty tier user (Gold) who owes rent..."

loyalty_user = User.create!(
  email: "loyalty_user@example.com",
  password: "Password123!",
  role: nil # resident
)

loyalty_app = RentalApplication.new(
  user: loyalty_user,
  property: meadows,
  unit: meadows_unit_3,
  unit_monthly_price: meadows_unit_3_price,
  move_in_date: Date.new(2024, 5, 1), # Moved in May 2024 (to get 6 payments for Gold tier)
  status: :approved,
  first_name: "Michael",
  last_name: "Chen",
  date_of_birth: Date.new(1992, 3, 10),
  gender: "Male"
)
loyalty_app.skip_move_in_date_validation = true
loyalty_app.save!

loyalty_lease = Lease.create!(
  rental_application: loyalty_app,
  property: meadows,
  unit: meadows_unit_3,
  move_in_date: Date.new(2024, 5, 1),
  signed: true,
  signed_date: Date.new(2024, 4, 20)
)

LeaseTenant.create!(
  lease: loyalty_lease,
  user: loyalty_user
)

# Create UserProperty with Gold loyalty tier
UserProperty.create!(
  user: loyalty_user,
  property: meadows,
  loyalty_tier: :gold
)

# Create 6+ historical payments that were paid on time (on or before 10th of month)
# First payment month is June 2024 (month after move-in in May)
payment_months = [
  Date.new(2024, 6, 1),
  Date.new(2024, 7, 1),
  Date.new(2024, 8, 1),
  Date.new(2024, 9, 1),
  Date.new(2024, 10, 1),
  Date.new(2024, 11, 1)
]

payment_months.each do |month|
  # Paid on the 5th of each month (on time - before 10th)
  Payment.create!(
    user: loyalty_user,
    lease: loyalty_lease,
    amount: 1300.00,
    due_date: month,
    payment_month: month,
    paid_date: Date.new(month.year, month.month, 5),
    status: :paid
  )
end

# Current payment for December 2024 - pending (not paid)
dec_payment_loyalty = Payment.create!(
  user: loyalty_user,
  lease: loyalty_lease,
  amount: 1300.00,
  due_date: Date.new(2024, 12, 1),
  payment_month: Date.new(2024, 12, 1),
  status: :pending
)

# ============================================================================
# SCENARIO 4: User with 2 overlapping active leases
# ============================================================================

puts "Creating Scenario 4: User with 2 overlapping active leases..."

dual_lease_user = User.create!(
  email: "dual_lease_user@example.com",
  password: "Password123!",
  role: nil # resident
)

# First lease at The Meadows
dual_lease_app_1 = RentalApplication.new(
  user: dual_lease_user,
  property: meadows,
  unit: meadows_unit_4,
  unit_monthly_price: meadows_unit_4_price,
  move_in_date: Date.new(2024, 9, 1),
  status: :approved,
  first_name: "Emily",
  last_name: "Rodriguez",
  date_of_birth: Date.new(1995, 11, 30),
  gender: "Female"
)
dual_lease_app_1.skip_move_in_date_validation = true
dual_lease_app_1.save!

dual_lease_1 = Lease.create!(
  rental_application: dual_lease_app_1,
  property: meadows,
  unit: meadows_unit_4,
  move_in_date: Date.new(2024, 9, 1),
  signed: true,
  signed_date: Date.new(2024, 8, 25)
)

LeaseTenant.create!(
  lease: dual_lease_1,
  user: dual_lease_user
)

# Second lease at Cassidy South (overlapping)
dual_lease_app_2 = RentalApplication.new(
  user: dual_lease_user,
  property: cassidy,
  unit: cassidy_unit_1,
  unit_monthly_price: cassidy_unit_1_price,
  move_in_date: Date.new(2024, 10, 15), # Overlaps with first lease
  status: :approved,
  first_name: "Emily",
  last_name: "Rodriguez",
  date_of_birth: Date.new(1995, 11, 30),
  gender: "Female"
)
dual_lease_app_2.skip_move_in_date_validation = true
dual_lease_app_2.save!

dual_lease_2 = Lease.create!(
  rental_application: dual_lease_app_2,
  property: cassidy,
  unit: cassidy_unit_1,
  move_in_date: Date.new(2024, 10, 15),
  signed: true,
  signed_date: Date.new(2024, 10, 1)
)

LeaseTenant.create!(
  lease: dual_lease_2,
  user: dual_lease_user
)

# UserProperty for both properties
UserProperty.create!(
  user: dual_lease_user,
  property: meadows,
  loyalty_tier: :bronze
)

UserProperty.create!(
  user: dual_lease_user,
  property: cassidy,
  loyalty_tier: :bronze
)

# Payments for first lease (The Meadows)
# October, November payments (paid)
Payment.create!(
  user: dual_lease_user,
  lease: dual_lease_1,
  amount: 1350.00,
  due_date: Date.new(2024, 10, 1),
  payment_month: Date.new(2024, 10, 1),
  paid_date: Date.new(2024, 10, 5),
  status: :paid
)

Payment.create!(
  user: dual_lease_user,
  lease: dual_lease_1,
  amount: 1350.00,
  due_date: Date.new(2024, 11, 1),
  payment_month: Date.new(2024, 11, 1),
  paid_date: Date.new(2024, 11, 3),
  status: :paid
)

# December payment pending
Payment.create!(
  user: dual_lease_user,
  lease: dual_lease_1,
  amount: 1350.00,
  due_date: Date.new(2024, 12, 1),
  payment_month: Date.new(2024, 12, 1),
  status: :pending
)

# Payments for second lease (Cassidy South)
# November payment (paid)
Payment.create!(
  user: dual_lease_user,
  lease: dual_lease_2,
  amount: 1100.00,
  due_date: Date.new(2024, 11, 1),
  payment_month: Date.new(2024, 11, 1),
  paid_date: Date.new(2024, 11, 8),
  status: :paid
)

# December payment pending
Payment.create!(
  user: dual_lease_user,
  lease: dual_lease_2,
  amount: 1100.00,
  due_date: Date.new(2024, 12, 1),
  payment_month: Date.new(2024, 12, 1),
  status: :pending
)

# ============================================================================
# SCENARIO 5: Maintenance user at a property
# ============================================================================

puts "Creating Scenario 5: Maintenance user..."

maintenance_user = User.create!(
  email: "maintenance@demo.com",
  password: "Password123!",
  role: 'maintenance'
)

# Assign maintenance user to The Meadows
UserProperty.create!(
  user: maintenance_user,
  property: meadows,
  loyalty_tier: :bronze # Not applicable but required field
)

# ============================================================================
# SCENARIO 6: Property admin at same property as maintenance user
# ============================================================================

puts "Creating Scenario 6: Property admin..."

property_admin = User.create!(
  email: "admin@demo.com",
  password: "Password123!",
  role: 'property_admin'
)

# Assign property admin to The Meadows (same as maintenance user)
UserProperty.create!(
  user: property_admin,
  property: meadows,
  loyalty_tier: :bronze # Not applicable but required field
)

# ============================================================================
# SCENARIO 7: Super admin
# ============================================================================

puts "Creating Scenario 7: Super admin..."

super_admin = User.create!(
  email: "superadmin@demo.com",
  password: "Password123!",
  role: 'super_admin'
)

# No UserProperty needed - super admin can access all properties

# ============================================================================
# SUMMARY
# ============================================================================

puts "\n" + "="*60
puts "Seed data creation complete!"
puts "="*60
puts "\nSummary:"
puts "  Properties: #{Property.count}"
puts "  Units: #{Unit.count}"
puts "  Users: #{User.count}"
puts "  Rental Applications: #{RentalApplication.count}"
puts "  Leases: #{Lease.count}"
puts "  Payments: #{Payment.count}"
puts "  User Properties: #{UserProperty.count}"
puts "\nDemo Users:"
puts "  1. pre_movein_user@example.com - Has lease, hasn't moved in"
puts "  2. moved_in_user@example.com - Moved in, owes rent"
puts "  3. loyalty_user@example.com - Gold tier, owes rent (with discount)"
puts "  4. dual_lease_user@example.com - Has 2 overlapping leases"
puts "  5. maintenance@demo.com - Maintenance user at The Meadows"
puts "  6. admin@demo.com - Property admin at The Meadows"
puts "  7. superadmin@demo.com - Super admin (access to all properties)"
puts "\n" + "="*60
