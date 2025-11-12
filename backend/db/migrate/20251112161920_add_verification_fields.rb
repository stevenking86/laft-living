class AddVerificationFields < ActiveRecord::Migration[8.0]
  def change
    add_column :verifications, :id_name_first, :string
    add_column :verifications, :id_name_last, :string
    add_column :verifications, :id_valid, :boolean, default: false
    add_column :verifications, :name_match, :boolean, default: false
    add_column :verifications, :verification_status, :string, default: 'pending'
    add_column :verifications, :ai_response, :jsonb
  end
end
