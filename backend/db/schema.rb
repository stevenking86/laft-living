# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_21_210146) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "lease_tenants", force: :cascade do |t|
    t.bigint "lease_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["lease_id", "user_id"], name: "index_lease_tenants_on_lease_id_and_user_id", unique: true
    t.index ["lease_id"], name: "index_lease_tenants_on_lease_id"
    t.index ["user_id"], name: "index_lease_tenants_on_user_id"
  end

  create_table "leases", force: :cascade do |t|
    t.bigint "rental_application_id", null: false
    t.bigint "property_id", null: false
    t.bigint "unit_id", null: false
    t.boolean "signed", default: false, null: false
    t.date "signed_date"
    t.date "move_in_date", null: false
    t.date "move_out_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["move_in_date"], name: "index_leases_on_move_in_date"
    t.index ["property_id"], name: "index_leases_on_property_id"
    t.index ["rental_application_id"], name: "index_leases_on_rental_application_id"
    t.index ["unit_id"], name: "index_leases_on_unit_id"
  end

  create_table "maintenance_requests", force: :cascade do |t|
    t.string "ticket_number", null: false
    t.bigint "user_id", null: false
    t.bigint "property_id", null: false
    t.bigint "unit_id"
    t.string "category", null: false
    t.text "description", null: false
    t.text "preferred_entry_time"
    t.boolean "resident_must_be_home", default: false, null: false
    t.string "urgency_level", null: false
    t.string "status", default: "Submitted", null: false
    t.bigint "assigned_maintenance_user_id"
    t.text "admin_notes"
    t.text "resident_visible_notes"
    t.text "resolution_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assigned_maintenance_user_id"], name: "index_maintenance_requests_on_assigned_maintenance_user_id"
    t.index ["property_id"], name: "index_maintenance_requests_on_property_id"
    t.index ["status"], name: "index_maintenance_requests_on_status"
    t.index ["ticket_number"], name: "index_maintenance_requests_on_ticket_number", unique: true
    t.index ["unit_id"], name: "index_maintenance_requests_on_unit_id"
    t.index ["urgency_level"], name: "index_maintenance_requests_on_urgency_level"
    t.index ["user_id"], name: "index_maintenance_requests_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "lease_id", null: false
    t.decimal "amount", precision: 8, scale: 2, null: false
    t.date "due_date", null: false
    t.date "paid_date"
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "payment_month"
    t.string "stripe_payment_intent_id"
    t.string "stripe_charge_id"
    t.index ["due_date"], name: "index_payments_on_due_date"
    t.index ["lease_id"], name: "index_payments_on_lease_id"
    t.index ["payment_month"], name: "index_payments_on_payment_month"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["user_id"], name: "index_payments_on_user_id"
  end

  create_table "properties", force: :cascade do |t|
    t.string "name", null: false
    t.text "address", null: false
    t.text "office_hours"
    t.boolean "pets_allowed", default: false, null: false
    t.boolean "has_parking", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rental_applications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "property_id", null: false
    t.bigint "unit_id", null: false
    t.date "move_in_date", null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "unit_monthly_price_id", null: false
    t.string "first_name"
    t.string "last_name"
    t.date "date_of_birth"
    t.string "gender"
    t.string "middle_name"
    t.index ["property_id"], name: "index_rental_applications_on_property_id"
    t.index ["status"], name: "index_rental_applications_on_status"
    t.index ["unit_id"], name: "index_rental_applications_on_unit_id"
    t.index ["unit_monthly_price_id"], name: "index_rental_applications_on_unit_monthly_price_id"
    t.index ["user_id"], name: "index_rental_applications_on_user_id"
  end

  create_table "unit_monthly_prices", force: :cascade do |t|
    t.bigint "unit_id", null: false
    t.string "term", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["unit_id", "term"], name: "index_unit_monthly_prices_on_unit_id_and_term", unique: true
    t.index ["unit_id"], name: "index_unit_monthly_prices_on_unit_id"
  end

  create_table "units", force: :cascade do |t|
    t.bigint "property_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id"], name: "index_units_on_property_id"
  end

  create_table "user_properties", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "property_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "loyalty_tier", default: 0, null: false
    t.index ["property_id"], name: "index_user_properties_on_property_id"
    t.index ["user_id", "property_id"], name: "index_user_properties_on_user_id_and_property_id", unique: true
    t.index ["user_id"], name: "index_user_properties_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest"
    t.string "role"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "verifications", force: :cascade do |t|
    t.bigint "rental_application_id", null: false
    t.bigint "user_id", null: false
    t.boolean "is_verified", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "id_name_first"
    t.string "id_name_last"
    t.boolean "id_valid", default: false
    t.boolean "name_match", default: false
    t.string "verification_status", default: "pending"
    t.jsonb "ai_response"
    t.string "id_name_middle"
    t.index ["rental_application_id"], name: "index_verifications_on_rental_application_id"
    t.index ["user_id"], name: "index_verifications_on_user_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "lease_tenants", "leases"
  add_foreign_key "lease_tenants", "users"
  add_foreign_key "leases", "properties"
  add_foreign_key "leases", "rental_applications"
  add_foreign_key "leases", "units"
  add_foreign_key "maintenance_requests", "properties"
  add_foreign_key "maintenance_requests", "units"
  add_foreign_key "maintenance_requests", "users"
  add_foreign_key "maintenance_requests", "users", column: "assigned_maintenance_user_id"
  add_foreign_key "payments", "leases"
  add_foreign_key "payments", "users"
  add_foreign_key "rental_applications", "properties"
  add_foreign_key "rental_applications", "unit_monthly_prices"
  add_foreign_key "rental_applications", "units"
  add_foreign_key "rental_applications", "users"
  add_foreign_key "unit_monthly_prices", "units"
  add_foreign_key "units", "properties"
  add_foreign_key "user_properties", "properties"
  add_foreign_key "user_properties", "users"
  add_foreign_key "verifications", "rental_applications"
  add_foreign_key "verifications", "users"
end
