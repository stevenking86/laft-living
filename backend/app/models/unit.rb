class Unit < ApplicationRecord
  belongs_to :property
  has_many :rental_applications, dependent: :destroy
  has_many :leases, dependent: :destroy

  validates :name, presence: true
  validates :property, presence: true
end
