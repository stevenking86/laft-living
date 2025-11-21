class Payment < ApplicationRecord
  belongs_to :user
  belongs_to :lease

  enum :status, { pending: 0, paid: 1, late: 2 }

  validates :user, presence: true
  validates :lease, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :due_date, presence: true
  validates :payment_month, presence: true

  # Scopes
  scope :for_month, ->(month) { where(payment_month: month) }
  scope :outstanding, -> { where(status: [:pending, :late]) }
  scope :paid, -> { where(status: :paid) }

  # Check if payment is overdue (after 10th of the month and not paid)
  def overdue?
    return false if paid?
    
    today = Date.today
    return false if payment_month.nil?
    
    # Payment is overdue if we're past the 10th of the payment month and it's not paid
    if today.year == payment_month.year && today.month == payment_month.month
      today.day > 10
    elsif today > payment_month
      true
    else
      false
    end
  end

  # Check if payment was paid on time (paid_date is on or before the 10th of the payment month)
  def on_time?
    return false unless paid? && paid_date.present? && payment_month.present?
    
    # Payment is on time if paid_date is on or before the 10th of the payment month
    payment_deadline = Date.new(payment_month.year, payment_month.month, 10)
    paid_date <= payment_deadline
  end

  # Check if payment is unpaid and late (status is late or pending AND payment is overdue)
  def unpaid_late?
    return false if paid?
    return false unless payment_month.present?
    
    (late? || pending?) && overdue?
  end
end
