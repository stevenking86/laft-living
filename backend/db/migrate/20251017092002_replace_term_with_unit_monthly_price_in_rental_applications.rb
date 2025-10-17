class ReplaceTermWithUnitMonthlyPriceInRentalApplications < ActiveRecord::Migration[8.0]
  def change
    # Remove the old term column
    remove_column :rental_applications, :term, :integer
    
    # Add the new unit_monthly_price reference
    add_reference :rental_applications, :unit_monthly_price, null: false, foreign_key: true, index: true
  end
end
