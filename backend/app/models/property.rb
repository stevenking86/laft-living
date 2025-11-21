class Property < ApplicationRecord
  has_many :units, dependent: :destroy
  has_many :rental_applications, dependent: :destroy
  has_many :leases, dependent: :destroy
  has_many :user_properties, dependent: :destroy
  has_many :users, through: :user_properties
  has_many :maintenance_requests, dependent: :destroy

  validates :name, presence: true
  validates :address, presence: true
end
