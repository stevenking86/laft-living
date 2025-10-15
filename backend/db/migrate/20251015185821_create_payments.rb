class CreatePayments < ActiveRecord::Migration[8.0]
  def change
    create_table :payments do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.references :lease, null: false, foreign_key: true, index: true
      t.decimal :amount, precision: 8, scale: 2, null: false
      t.date :due_date, null: false
      t.date :paid_date
      t.integer :status, default: 0, null: false

      t.timestamps
    end

    add_index :payments, :due_date
    add_index :payments, :status
  end
end
