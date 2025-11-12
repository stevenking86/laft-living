class Verification < ApplicationRecord
  belongs_to :rental_application
  belongs_to :user

  has_one_attached :id_image

  validates :rental_application, presence: true
  validates :user, presence: true
end
