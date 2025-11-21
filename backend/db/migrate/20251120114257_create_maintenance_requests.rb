class CreateMaintenanceRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :maintenance_requests do |t|
      t.string :ticket_number, null: false
      t.references :user, null: false, foreign_key: true
      t.references :property, null: false, foreign_key: true
      t.references :unit, null: true, foreign_key: true
      t.string :category, null: false
      t.text :description, null: false
      t.text :preferred_entry_time
      t.boolean :resident_must_be_home, default: false, null: false
      t.string :urgency_level, null: false
      t.string :status, default: 'Submitted', null: false
      t.references :assigned_maintenance_user, null: true, foreign_key: { to_table: :users }
      t.text :admin_notes
      t.text :resident_visible_notes
      t.text :resolution_notes

      t.timestamps
    end
    
    add_index :maintenance_requests, :ticket_number, unique: true
    add_index :maintenance_requests, :status
    add_index :maintenance_requests, :urgency_level
    # Note: property_id index is automatically created by the foreign key reference
  end
end
