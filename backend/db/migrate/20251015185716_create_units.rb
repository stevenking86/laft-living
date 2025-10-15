class CreateUnits < ActiveRecord::Migration[8.0]
  def change
    create_table :units do |t|
      t.references :property, null: false, foreign_key: true, index: true
      t.string :name, null: false

      t.timestamps
    end
  end
end
