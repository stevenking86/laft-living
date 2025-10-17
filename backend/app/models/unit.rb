class Unit < ApplicationRecord
  belongs_to :property
  has_many :rental_applications, dependent: :destroy
  has_many :leases, dependent: :destroy
  has_many :unit_monthly_prices, dependent: :destroy

  validates :name, presence: true
  validates :property, presence: true

  # Check if unit is currently available (no active lease)
  def available?
    # A unit is available if it has no leases with move_out_date in the future or null
    leases.where('move_out_date IS NULL OR move_out_date > ?', Date.current).empty?
  end

  # Get the current active lease if any
  def current_lease
    leases.where('move_out_date IS NULL OR move_out_date > ?', Date.current).first
  end

  # Class method to get all available units
  def self.available
    # A unit is available if it has no active leases
    # Active lease = lease with move_out_date in the future or null
    left_joins(:leases)
      .where('leases.id IS NULL OR leases.move_out_date <= ?', Date.current)
      .distinct
  end
end
