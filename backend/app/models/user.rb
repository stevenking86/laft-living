class User < ApplicationRecord
  # has_secure_password  # Temporarily disabled due to bcrypt loading issue
  
  has_many :rental_applications, dependent: :destroy
  has_many :verifications, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :lease_tenants, dependent: :destroy
  has_many :leases, through: :lease_tenants
  has_many :user_properties, dependent: :destroy
  has_many :properties, through: :user_properties
  has_many :maintenance_requests, dependent: :destroy
  has_many :assigned_maintenance_requests, class_name: 'MaintenanceRequest', foreign_key: 'assigned_maintenance_user_id', dependent: :nullify
  
  validates :email, presence: true, uniqueness: true
  # validates :password, presence: true, length: { minimum: 6 }, on: :create
  # validates :password_confirmation, presence: true, on: :create
  
  # Role helper methods
  # resident: Access to own data (leases, payments, maintenance requests)
  # property_admin: Manager dashboard for assigned properties
  # maintenance: Maintenance dashboard for assigned properties
  # super_admin: Access to all properties, both manager and maintenance dashboards
  def resident?
    role.nil? || role == 'resident'
  end
  
  def property_admin?
    role == 'property_admin'
  end
  
  def maintenance?
    role == 'maintenance'
  end
  
  def super_admin?
    role == 'super_admin'
  end
  
  # Returns all properties user can access based on role
  def accessible_properties
    if super_admin?
      Property.all
    elsif property_admin? || maintenance?
      properties
    else
      # Residents access properties through their leases
      Property.joins(units: { leases: :lease_tenants })
              .where(lease_tenants: { user_id: id })
              .distinct
    end
  end
  
  # Check if user can access a specific property
  def can_access_property?(property_id)
    if super_admin?
      true
    elsif property_admin? || maintenance?
      properties.exists?(property_id)
    else
      # Residents can access if they have a lease for a unit in that property
      Property.joins(units: { leases: :lease_tenants })
              .where(id: property_id)
              .where(lease_tenants: { user_id: id })
              .exists?
    end
  end
end
