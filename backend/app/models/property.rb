class Property < ApplicationRecord
  has_many :units, dependent: :destroy
  has_many :rental_applications, dependent: :destroy
  has_many :leases, dependent: :destroy

  validates :name, presence: true
  validates :address, presence: true
end
