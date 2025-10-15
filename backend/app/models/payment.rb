class Payment < ApplicationRecord
  belongs_to :user
  belongs_to :lease

  enum status: { pending: 0, paid: 1, late: 2 }

  validates :user, presence: true
  validates :lease, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :due_date, presence: true
end
