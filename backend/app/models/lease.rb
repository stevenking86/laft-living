class Lease < ApplicationRecord
  belongs_to :rental_application
  belongs_to :property
  belongs_to :unit

  has_many :payments, dependent: :destroy
  has_many :lease_tenants, dependent: :destroy

  validates :rental_application, presence: true
  validates :property, presence: true
  validates :unit, presence: true
  validates :move_in_date, presence: true
  validate :move_out_date_after_move_in_date

  # Get monthly rent amount from the rental application's unit monthly price
  def monthly_rent
    rental_application&.unit_monthly_price&.price
  end

  private

  def move_out_date_after_move_in_date
    return unless move_out_date.present? && move_in_date.present?
    
    if move_out_date <= move_in_date
      errors.add(:move_out_date, "must be after move in date")
    end
  end
end
