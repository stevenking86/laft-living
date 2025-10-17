class CreateUnitMonthlyPrices < ActiveRecord::Migration[8.0]
  def change
    create_table :unit_monthly_prices do |t|
      t.references :unit, null: false, foreign_key: true
      t.string :term, null: false
      t.decimal :price, precision: 10, scale: 2, null: false

      t.timestamps
    end
    
    add_index :unit_monthly_prices, [:unit_id, :term], unique: true
  end
end
