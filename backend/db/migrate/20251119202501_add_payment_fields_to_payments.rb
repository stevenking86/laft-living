class AddPaymentFieldsToPayments < ActiveRecord::Migration[8.0]
  def change
    add_column :payments, :payment_month, :date
    add_column :payments, :stripe_payment_intent_id, :string
    add_column :payments, :stripe_charge_id, :string
    
    add_index :payments, :payment_month
  end
end

