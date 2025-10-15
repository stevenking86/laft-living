class User < ApplicationRecord
  # has_secure_password  # Temporarily disabled due to bcrypt loading issue
  
  has_many :rental_applications, dependent: :destroy
  has_many :verifications, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :lease_tenants, dependent: :destroy
  has_many :leases, through: :lease_tenants
  
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  # validates :password, presence: true, length: { minimum: 6 }, on: :create
  # validates :password_confirmation, presence: true, on: :create
end
