class RentalApplication < ApplicationRecord
  belongs_to :user
  belongs_to :property
  belongs_to :unit

  has_one :verification, dependent: :destroy
  has_one :lease, dependent: :destroy

  enum :status, { pending: 0, approved: 1, denied: 2 }

  validates :user, presence: true
  validates :property, presence: true
  validates :unit, presence: true
  validates :move_in_date, presence: true
  validates :term, presence: true, numericality: { greater_than: 0 }
end
