class LoyaltyTierService
  def initialize(user, property)
    @user = user
    @property = property
  end

  # Calculate tier for a user at a property based on payment history
  def calculate_tier
    # Get all payments for this user at this property
    payments = @user.payments
      .joins(lease: :property)
      .where(properties: { id: @property.id })
      .includes(:lease)

    # Count on-time payments (paid_date is on or before the 10th of the payment month)
    on_time_count = payments.select(&:on_time?).count

    # Check for unpaid late payments
    has_unpaid_late = payments.any?(&:unpaid_late?)

    # Determine tier based on criteria
    if on_time_count >= 6 && !has_unpaid_late
      :gold
    elsif on_time_count >= 3 && !has_unpaid_late
      :silver
    else
      :bronze
    end
  end

  # Calculate and update tier in the database
  def update_tier
    # Find or create user_property record
    user_property = UserProperty.find_or_create_by(
      user: @user,
      property: @property
    )

    # Calculate new tier
    new_tier = calculate_tier

    # Update tier if it has changed
    if user_property.loyalty_tier != new_tier.to_s
      user_property.update(loyalty_tier: new_tier)
    end

    new_tier
  end

  # Get current tier for user at property
  def current_tier
    user_property = UserProperty.find_by(user: @user, property: @property)
    return :bronze unless user_property
    
    user_property.loyalty_tier_symbol
  end

  # Get on-time payment count
  def on_time_payments_count
    @user.payments
      .joins(lease: :property)
      .where(properties: { id: @property.id })
      .select(&:on_time?)
      .count
  end

  # Get next tier and payments needed
  def next_tier_info
    current = current_tier
    on_time_count = on_time_payments_count

    case current
    when :bronze
      { next_tier: :silver, payments_needed: [0, 3 - on_time_count].max }
    when :silver
      { next_tier: :gold, payments_needed: [0, 6 - on_time_count].max }
    when :gold
      { next_tier: nil, payments_needed: 0 }
    end
  end

  # Get discount percentage for current tier
  def discount_percentage
    case current_tier
    when :silver
      3
    when :gold
      5
    else
      0
    end
  end
end

