class MaintenanceRequest < ApplicationRecord
  belongs_to :user
  belongs_to :property
  belongs_to :unit, optional: true
  belongs_to :assigned_maintenance_user, class_name: 'User', foreign_key: 'assigned_maintenance_user_id', optional: true
  
  has_many_attached :photos
  
  validates :category, presence: true, inclusion: { in: ['Plumbing', 'Electrical', 'Appliance', 'Heating/Cooling', 'Pest', 'General'] }
  validates :description, presence: true
  validates :urgency_level, presence: true, inclusion: { in: ['Emergency', 'Urgent', 'Routine'] }
  validates :status, presence: true, inclusion: { in: ['Submitted', 'Scheduled', 'In Progress', 'Completed'] }
  
  before_create :generate_ticket_number
  after_create :auto_assign_maintenance_user
  
  scope :by_status, ->(status) { where(status: status) }
  scope :by_urgency, ->(urgency) { where(urgency_level: urgency) }
  scope :for_property, ->(property_id) { where(property_id: property_id) }
  
  private
  
  def generate_ticket_number
    last_ticket = MaintenanceRequest.order(ticket_number: :desc).first
    if last_ticket && last_ticket.ticket_number.present?
      # Extract number from ticket_number (e.g., "MR-1001" -> 1001)
      last_number = last_ticket.ticket_number.match(/\d+$/).to_s.to_i
      new_number = last_number + 1
    else
      new_number = 1001
    end
    self.ticket_number = "MR-#{new_number}"
  end
  
  def auto_assign_maintenance_user
    # Find first maintenance user for this property
    maintenance_user = User.joins(:user_properties)
                          .where(role: 'maintenance')
                          .where(user_properties: { property_id: property_id })
                          .first
    
    if maintenance_user
      update_column(:assigned_maintenance_user_id, maintenance_user.id)
    end
  end
end

