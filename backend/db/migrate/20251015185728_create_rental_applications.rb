class CreateRentalApplications < ActiveRecord::Migration[8.0]
  def change
    create_table :rental_applications do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.references :property, null: false, foreign_key: true, index: true
      t.references :unit, null: false, foreign_key: true, index: true
      t.date :move_in_date, null: false
      t.integer :term, null: false
      t.integer :status, default: 0, null: false

      t.timestamps
    end

    add_index :rental_applications, :status
  end
end
