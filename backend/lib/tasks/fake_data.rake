namespace :fake_data do
  desc "Seed fake properties and units for testing"
  task seed: :environment do
    puts "🌱 Seeding fake test data..."
    
    # Create The Meadows property
    meadows = Property.create!(
      name: "The Meadows",
      address: "123 Meadow Lane, Springfield, IL 62701",
      office_hours: "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM",
      pets_allowed: true,
      has_parking: true
    )
    
    # Create units for The Meadows
    meadows_units = [
      "Unit 101",
      "Unit 102", 
      "Unit 103"
    ]
    
    meadows_units.each do |unit_name|
      unit = Unit.create!(
        property: meadows,
        name: unit_name
      )
      
      # Create pricing tiers for this unit (shorter terms = higher prices)
      UnitMonthlyPrice.create!([
        { unit: unit, term: "9 months", price: 1000.00 },
        { unit: unit, term: "12 months", price: 950.00 },
        { unit: unit, term: "24 months", price: 900.00 }
      ])
    end
    
    puts "✅ Created property: #{meadows.name} with #{meadows.units.count} units"
    
    # Create Cassidy South property
    cassidy = Property.create!(
      name: "Cassidy South",
      address: "456 South Street, Springfield, IL 62702",
      office_hours: "Monday-Friday: 8AM-7PM, Saturday: 9AM-5PM",
      pets_allowed: false,
      has_parking: true
    )
    
    # Create units for Cassidy South
    cassidy_units = [
      "Unit 201",
      "Unit 202"
    ]
    
    cassidy_units.each do |unit_name|
      unit = Unit.create!(
        property: cassidy,
        name: unit_name
      )
      
      # Create pricing tiers for this unit (shorter terms = higher prices)
      UnitMonthlyPrice.create!([
        { unit: unit, term: "9 months", price: 1000.00 },
        { unit: unit, term: "12 months", price: 950.00 },
        { unit: unit, term: "24 months", price: 900.00 }
      ])
    end
    
    puts "✅ Created property: #{cassidy.name} with #{cassidy.units.count} units"
    
    total_properties = Property.count
    total_units = Unit.count
    total_prices = UnitMonthlyPrice.count
    
    puts "🎉 Fake data seeding complete!"
    puts "   Total properties: #{total_properties}"
    puts "   Total units: #{total_units}"
    puts "   Total unit monthly prices: #{total_prices}"
  end

  desc "Destroy all fake test data"
  task destroy: :environment do
    puts "🗑️  Destroying fake test data..."
    
    # Find and destroy the fake properties by name
    fake_properties = Property.where(name: ["The Meadows", "Cassidy South"])
    
    if fake_properties.empty?
      puts "ℹ️  No fake properties found to destroy"
      return
    end
    
    destroyed_units = 0
    destroyed_properties = 0
    
    fake_properties.each do |property|
      units_count = property.units.count
      destroyed_units += units_count
      property.destroy!
      destroyed_properties += 1
      puts "✅ Destroyed property: #{property.name} and #{units_count} units"
    end
    
    puts "🎉 Fake data destruction complete!"
    puts "   Destroyed properties: #{destroyed_properties}"
    puts "   Destroyed units: #{destroyed_units}"
  end
end
