class AddPersonalInfoToRentalApplications < ActiveRecord::Migration[8.0]
  def change
    add_column :rental_applications, :first_name, :string
    add_column :rental_applications, :last_name, :string
    add_column :rental_applications, :date_of_birth, :date
    add_column :rental_applications, :gender, :string
  end
end
