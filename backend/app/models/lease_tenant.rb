class LeaseTenant < ApplicationRecord
  belongs_to :lease
  belongs_to :user

  validates :lease, presence: true
  validates :user, presence: true
  validates :user_id, uniqueness: { scope: :lease_id }
end
