class CreateLeases < ActiveRecord::Migration[8.0]
  def change
    create_table :leases do |t|
      t.references :rental_application, null: false, foreign_key: true, index: true
      t.references :property, null: false, foreign_key: true, index: true
      t.references :unit, null: false, foreign_key: true, index: true
      t.boolean :signed, default: false, null: false
      t.date :signed_date
      t.date :move_in_date, null: false
      t.date :move_out_date

      t.timestamps
    end

    add_index :leases, :move_in_date
  end
end
