class AddMiddleNameToRentalApplications < ActiveRecord::Migration[8.0]
  def change
    add_column :rental_applications, :middle_name, :string
  end
end
