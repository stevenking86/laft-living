class UnitMonthlyPrice < ApplicationRecord
  belongs_to :unit
  has_many :rental_applications, dependent: :destroy

  enum :term, {
    "6 months" => "6 months",
    "9 months" => "9 months", 
    "12 months" => "12 months",
    "18 months" => "18 months",
    "24 months" => "24 months"
  }

  validates :term, presence: true, inclusion: { in: terms.keys }
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :unit_id, uniqueness: { scope: :term, message: "already has a price for this term" }
end
