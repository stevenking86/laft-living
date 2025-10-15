class CreateLeaseTenants < ActiveRecord::Migration[8.0]
  def change
    create_table :lease_tenants do |t|
      t.references :lease, null: false, foreign_key: true, index: true
      t.references :user, null: false, foreign_key: true, index: true

      t.timestamps
    end

    add_index :lease_tenants, [:lease_id, :user_id], unique: true
  end
end
