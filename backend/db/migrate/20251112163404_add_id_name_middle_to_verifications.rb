class AddIdNameMiddleToVerifications < ActiveRecord::Migration[8.0]
  def change
    add_column :verifications, :id_name_middle, :string
  end
end
