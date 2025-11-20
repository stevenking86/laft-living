class PaymentCalculationService
  def initialize(lease, user)
    @lease = lease
    @user = user
    @monthly_rent = lease.monthly_rent
  end

  # Calculate and return outstanding payments for the lease
  def outstanding_payments
    return [] unless @monthly_rent

    today = Date.today
    outstanding = []

    # First payment is due the month AFTER move_in_date
    first_payment_month = (@lease.move_in_date.beginning_of_month + 1.month).beginning_of_month
    
    # Determine the last month we should check
    # If after 20th of current month, include next month
    last_month_to_check = if today.day > 20
      (today.beginning_of_month + 1.month).beginning_of_month
    else
      today.beginning_of_month
    end

    # Only check months if first payment month has been reached or passed
    return [] if first_payment_month > last_month_to_check

    # Iterate through each month from first payment month to last month to check
    current_month = first_payment_month
    while current_month <= last_month_to_check
      # Find or create payment for this month
      payment = @lease.payments.find_or_initialize_by(
        user: @user,
        payment_month: current_month
      )

      # Reload the payment if it's persisted to ensure we have the latest status
      payment.reload if payment.persisted?

      # Set payment details if it's a new record
      if payment.new_record?
        payment.amount = @monthly_rent
        payment.due_date = current_month
        payment.status = :pending
      end

      # Only include if not paid
      unless payment.paid?
        outstanding << payment
      end

      current_month = current_month + 1.month
    end

    outstanding
  end

  # Calculate total amount owed
  def total_amount_owed
    outstanding_payments.sum(&:amount)
  end

  # Get overdue payments (after 10th of month and not paid)
  def overdue_payments
    outstanding_payments.select(&:overdue?)
  end

  # Check if there are any overdue payments
  def has_overdue?
    overdue_payments.any?
  end

  # Get the last paid payment date
  def last_paid_date
    last_payment = @lease.payments.paid.order(payment_month: :desc).first
    last_payment&.paid_date
  end
end

