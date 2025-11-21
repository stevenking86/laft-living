class Api::V1::PaymentsController < ApplicationController
  before_action :authenticate_user
  before_action :set_active_lease, only: [:outstanding, :last_paid, :create_intent, :confirm]

  # GET /api/v1/payments/outstanding
  def outstanding
    service = PaymentCalculationService.new(@active_lease, @current_user)
    outstanding_payments = service.outstanding_payments
    
    # Save any new payment records
    outstanding_payments.each { |payment| payment.save if payment.new_record? }
    
    render json: {
      outstanding_payments: outstanding_payments.map { |p| payment_json(p, service) },
      total_amount: service.total_amount_owed.to_f,
      original_total_amount: service.original_total_amount.to_f,
      has_overdue: service.has_overdue?,
      overdue_payments: service.overdue_payments.map { |p| payment_json(p, service) },
      current_tier: service.current_tier.to_s,
      discount_percentage: service.discount_percentage,
      discount_applied: service.discount_applied?
    }
  end

  # GET /api/v1/payments/last_paid
  def last_paid
    service = PaymentCalculationService.new(@active_lease, @current_user)
    last_paid_date = service.last_paid_date
    
    render json: {
      last_paid_date: last_paid_date
    }
  end

  # POST /api/v1/payments/create_intent
  def create_intent
    service = PaymentCalculationService.new(@active_lease, @current_user)
    outstanding_payments = service.outstanding_payments
    
    if outstanding_payments.empty?
      render json: { error: 'No outstanding payments' }, status: :unprocessable_entity
      return
    end

    total_amount = service.total_amount_owed
    amount_in_cents = (total_amount * 100).to_i

    begin
      # Create Stripe Checkout Session
      frontend_url = ENV['FRONTEND_URL'] || 'http://localhost:3000'
      success_url = "#{frontend_url}/live/pay-rent?session_id={CHECKOUT_SESSION_ID}"
      cancel_url = "#{frontend_url}/live/pay-rent?canceled=true"
      
      session = Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: "Rent Payment - #{outstanding_payments.map { |p| p.payment_month.strftime('%B %Y') }.join(', ')}",
            },
            unit_amount: amount_in_cents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          user_id: @current_user.id,
          lease_id: @active_lease.id,
          payment_months: outstanding_payments.map { |p| p.payment_month.to_s }.join(',')
        }
      )

      # Store session ID in outstanding payments (we'll use this to find them later)
      outstanding_payments.each do |payment|
        payment.stripe_payment_intent_id = session.id # Reusing this field for session ID
        payment.save if payment.persisted?
      end

      render json: {
        session_id: session.id,
        url: session.url,
        amount: total_amount.to_f
      }
    rescue Stripe::StripeError => e
      render json: { error: "Stripe error: #{e.message}" }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/payments/confirm
  def confirm
    session_id = params[:session_id]
    
    unless session_id
      render json: { error: 'Session ID is required' }, status: :unprocessable_entity
      return
    end

    begin
      # Retrieve the checkout session from Stripe
      session = Stripe::Checkout::Session.retrieve(session_id)
      
      # Verify it belongs to the current user
      unless session.metadata['user_id'].to_i == @current_user.id
        render json: { error: 'Unauthorized' }, status: :unauthorized
        return
      end

      # Find payments associated with this session
      payments = @active_lease.payments.where(stripe_payment_intent_id: session_id)
      
      if payments.empty?
        render json: { error: 'Payments not found' }, status: :not_found
        return
      end

      # Update payments if payment was successful
      if session.payment_status == 'paid'
        payments.each do |payment|
          payment.status = :paid
          payment.paid_date = Date.today
          payment.stripe_charge_id = session.payment_intent # Store payment intent ID from session
          payment.save
        end

        # Recalculate loyalty tier after payment
        loyalty_service = LoyaltyTierService.new(@current_user, @active_lease.property)
        loyalty_service.update_tier

        render json: {
          message: 'Payment confirmed successfully',
          payments: payments.map { |p| payment_json(p, nil) }
        }
      else
        render json: { error: "Payment not succeeded. Status: #{session.payment_status}" }, status: :unprocessable_entity
      end
    rescue Stripe::StripeError => e
      render json: { error: "Stripe error: #{e.message}" }, status: :unprocessable_entity
    end
  end

  private

  def set_active_lease
    # Find active lease for the current user
    today = Date.today
    
    @active_lease = @current_user.leases.joins(:rental_application)
      .where(rental_applications: { status: :approved })
      .where('leases.move_in_date <= ?', today)
      .where('leases.move_out_date IS NULL OR leases.move_out_date >= ?', today)
      .first

    unless @active_lease
      render json: { error: 'No active lease found' }, status: :not_found
    end
  end

  def payment_json(payment, service = nil)
    chargeable = service ? service.chargeable_amount(payment) : payment.amount.to_f
    original = payment.amount.to_f
    
    result = {
      id: payment.id,
      amount: chargeable,
      original_amount: original,
      payment_month: payment.payment_month,
      due_date: payment.due_date,
      status: payment.status,
      paid_date: payment.paid_date,
      overdue: payment.overdue?,
      stripe_payment_intent_id: payment.stripe_payment_intent_id
    }
    
    # Add discount info if service is provided and discount applies
    if service && service.discount_applied?
      result[:discount_applied] = true
      result[:discount_amount] = (original - chargeable).round(2)
    end
    
    result
  end
end

