class UserProperty < ApplicationRecord
  belongs_to :user
  belongs_to :property
  
  enum :loyalty_tier, { bronze: 0, silver: 1, gold: 2 }
  
  validates :user_id, uniqueness: { scope: :property_id }

  # Return tier as symbol
  def loyalty_tier_symbol
    return :bronze unless loyalty_tier
    loyalty_tier.to_sym
  end
end

