class Verification < ApplicationRecord
  belongs_to :rental_application
  belongs_to :user

  validates :rental_application, presence: true
  validates :user, presence: true
end
