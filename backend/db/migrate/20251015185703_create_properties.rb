class CreateProperties < ActiveRecord::Migration[8.0]
  def change
    create_table :properties do |t|
      t.string :name, null: false
      t.text :address, null: false
      t.text :office_hours
      t.boolean :pets_allowed, default: false, null: false
      t.boolean :has_parking, default: false, null: false

      t.timestamps
    end
  end
end
