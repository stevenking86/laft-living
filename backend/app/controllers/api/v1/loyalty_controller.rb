class Api::V1::LoyaltyController < ApplicationController
  before_action :authenticate_user
  before_action :set_active_lease

  # GET /api/v1/loyalty/status
  def index
    loyalty_service = LoyaltyTierService.new(@current_user, @active_lease.property)
    next_tier_info = loyalty_service.next_tier_info

    render json: {
      tier: loyalty_service.current_tier.to_s,
      on_time_payments_count: loyalty_service.on_time_payments_count,
      next_tier: next_tier_info[:next_tier]&.to_s,
      payments_needed_for_next_tier: next_tier_info[:payments_needed],
      discount_percentage: loyalty_service.discount_percentage,
      property: {
        id: @active_lease.property.id,
        name: @active_lease.property.name
      }
    }
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
end

