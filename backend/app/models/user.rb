class User < ApplicationRecord
  # has_secure_password  # Temporarily disabled due to bcrypt loading issue
  
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  # validates :password, presence: true, length: { minimum: 6 }, on: :create
  # validates :password_confirmation, presence: true, on: :create
end
