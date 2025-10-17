class RentalApplication < ApplicationRecord
  belongs_to :user
  belongs_to :property
  belongs_to :unit
  belongs_to :unit_monthly_price

  has_one :verification, dependent: :destroy
  has_one :lease, dependent: :destroy

  enum :status, { pending: 0, approved: 1, denied: 2 }

  validates :user, presence: true
  validates :property, presence: true
  validates :unit, presence: true
  validates :unit_monthly_price, presence: true
  validates :move_in_date, presence: true
  
  # Ensure the unit_monthly_price belongs to the same unit
  validate :unit_monthly_price_matches_unit

  private

  def unit_monthly_price_matches_unit
    return unless unit_monthly_price && unit
    
    unless unit_monthly_price.unit_id == unit.id
      errors.add(:unit_monthly_price, "must belong to the selected unit")
    end
  end
end
