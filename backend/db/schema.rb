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

ActiveRecord::Schema[8.0].define(version: 2025_10_15_185838) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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

  create_table "payments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "lease_id", null: false
    t.decimal "amount", precision: 8, scale: 2, null: false
    t.date "due_date", null: false
    t.date "paid_date"
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["due_date"], name: "index_payments_on_due_date"
    t.index ["lease_id"], name: "index_payments_on_lease_id"
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
    t.integer "term", null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id"], name: "index_rental_applications_on_property_id"
    t.index ["status"], name: "index_rental_applications_on_status"
    t.index ["unit_id"], name: "index_rental_applications_on_unit_id"
    t.index ["user_id"], name: "index_rental_applications_on_user_id"
  end

  create_table "units", force: :cascade do |t|
    t.bigint "property_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id"], name: "index_units_on_property_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "verifications", force: :cascade do |t|
    t.bigint "rental_application_id", null: false
    t.bigint "user_id", null: false
    t.boolean "is_verified", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["rental_application_id"], name: "index_verifications_on_rental_application_id"
    t.index ["user_id"], name: "index_verifications_on_user_id"
  end

  add_foreign_key "lease_tenants", "leases"
  add_foreign_key "lease_tenants", "users"
  add_foreign_key "leases", "properties"
  add_foreign_key "leases", "rental_applications"
  add_foreign_key "leases", "units"
  add_foreign_key "payments", "leases"
  add_foreign_key "payments", "users"
  add_foreign_key "rental_applications", "properties"
  add_foreign_key "rental_applications", "units"
  add_foreign_key "rental_applications", "users"
  add_foreign_key "units", "properties"
  add_foreign_key "verifications", "rental_applications"
  add_foreign_key "verifications", "users"
end
