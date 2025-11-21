class Api::V1::MaintenanceRequestsController < ApplicationController
  before_action :authenticate_user
  before_action :set_maintenance_request, only: [:show, :update, :add_photos, :update_resolution]
  
  def index
    # Filter by role: residents see own, admins see accessible properties
    if @current_user.resident?
      @maintenance_requests = @current_user.maintenance_requests
                                          .includes(:property, :unit, :assigned_maintenance_user)
                                          .order(created_at: :desc)
    elsif @current_user.property_admin? || @current_user.maintenance? || @current_user.super_admin?
      property_ids = accessible_properties.pluck(:id)
      @maintenance_requests = MaintenanceRequest.where(property_id: property_ids)
                                                .includes(:property, :unit, :user, :assigned_maintenance_user)
                                                .order(created_at: :desc)
    else
      @maintenance_requests = []
    end
    
    render json: @maintenance_requests.map { |mr| maintenance_request_json(mr) }
  end
  
  def maintenance_users
    # Get maintenance users for a specific property
    property_id = params[:property_id]
    
    unless @current_user.property_admin? || @current_user.super_admin?
      render json: { error: 'Property admin access required' }, status: :forbidden
      return
    end
    
    unless @current_user.can_access_property?(property_id.to_i)
      render json: { error: 'Access denied to this property' }, status: :forbidden
      return
    end
    
    maintenance_users = User.joins(:user_properties)
                           .where(role: 'maintenance')
                           .where(user_properties: { property_id: property_id })
                           .select(:id, :email)
    
    render json: maintenance_users.map { |u| { id: u.id, email: u.email } }
  end
  
  def show
    # Check authorization
    unless can_view_request?(@maintenance_request)
      render json: { error: 'Access denied' }, status: :forbidden
      return
    end
    
    render json: maintenance_request_json(@maintenance_request)
  end
  
  def create
    # Only residents can create maintenance requests
    unless @current_user.resident?
      render json: { error: 'Only residents can create maintenance requests' }, status: :forbidden
      return
    end
    
    # Find property from user's active lease
    active_lease = @current_user.leases.joins(:rental_application)
                                 .where(rental_applications: { status: 'approved' })
                                 .where('leases.move_in_date <= ?', Date.today)
                                 .where('leases.move_out_date IS NULL OR leases.move_out_date >= ?', Date.today)
                                 .first
    
    unless active_lease
      render json: { error: 'No active lease found' }, status: :unprocessable_entity
      return
    end
    
    @maintenance_request = MaintenanceRequest.new(maintenance_request_params)
    @maintenance_request.user = @current_user
    @maintenance_request.property = active_lease.property
    @maintenance_request.unit = active_lease.unit
    
    if @maintenance_request.save
      # Attach photos if provided
      if params[:photos].present?
        params[:photos].each do |photo|
          @maintenance_request.photos.attach(photo)
        end
      end
      
      render json: maintenance_request_json(@maintenance_request), status: :created
    else
      render json: {
        error: 'Failed to create maintenance request',
        errors: @maintenance_request.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def update
    # Only property admins and super admins can update
    unless @current_user.property_admin? || @current_user.super_admin?
      render json: { error: 'Property admin access required' }, status: :forbidden
      return
    end
    
    # Check property access
    unless @current_user.can_access_property?(@maintenance_request.property_id)
      render json: { error: 'Access denied to this property' }, status: :forbidden
      return
    end
    
    if @maintenance_request.update(update_params)
      render json: maintenance_request_json(@maintenance_request)
    else
      render json: {
        error: 'Failed to update maintenance request',
        errors: @maintenance_request.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def add_photos
    # Only maintenance users and super admins can add photos
    unless @current_user.maintenance? || @current_user.super_admin?
      render json: { error: 'Maintenance user access required' }, status: :forbidden
      return
    end
    
    # Check if assigned to this request or super admin
    unless @maintenance_request.assigned_maintenance_user_id == @current_user.id || @current_user.super_admin?
      render json: { error: 'Not assigned to this request' }, status: :forbidden
      return
    end
    
    if params[:photos].present?
      params[:photos].each do |photo|
        @maintenance_request.photos.attach(photo)
      end
      render json: maintenance_request_json(@maintenance_request)
    else
      render json: { error: 'No photos provided' }, status: :unprocessable_entity
    end
  end
  
  def update_resolution
    # Only maintenance users and super admins can update resolution
    unless @current_user.maintenance? || @current_user.super_admin?
      render json: { error: 'Maintenance user access required' }, status: :forbidden
      return
    end
    
    # Check if assigned to this request or super admin
    unless @maintenance_request.assigned_maintenance_user_id == @current_user.id || @current_user.super_admin?
      render json: { error: 'Not assigned to this request' }, status: :forbidden
      return
    end
    
    update_data = {}
    update_data[:resolution_notes] = params[:resolution_notes] if params[:resolution_notes].present?
    update_data[:status] = params[:status] if params[:status].present?
    
    if params[:photos].present?
      params[:photos].each do |photo|
        @maintenance_request.photos.attach(photo)
      end
    end
    
    if @maintenance_request.update(update_data)
      render json: maintenance_request_json(@maintenance_request)
    else
      render json: {
        error: 'Failed to update resolution',
        errors: @maintenance_request.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_maintenance_request
    @maintenance_request = MaintenanceRequest.find(params[:id])
  end
  
  def can_view_request?(request)
    if @current_user.resident?
      request.user_id == @current_user.id
    elsif @current_user.property_admin? || @current_user.maintenance? || @current_user.super_admin?
      @current_user.can_access_property?(request.property_id)
    else
      false
    end
  end
  
  def maintenance_request_params
    params.require(:maintenance_request).permit(
      :category,
      :description,
      :preferred_entry_time,
      :resident_must_be_home,
      :urgency_level
    )
  end
  
  def update_params
    params.require(:maintenance_request).permit(
      :urgency_level,
      :status,
      :assigned_maintenance_user_id,
      :admin_notes,
      :resident_visible_notes
    )
  end
  
  def maintenance_request_json(request)
    {
      id: request.id,
      ticket_number: request.ticket_number,
      category: request.category,
      description: request.description,
      preferred_entry_time: request.preferred_entry_time,
      resident_must_be_home: request.resident_must_be_home,
      urgency_level: request.urgency_level,
      status: request.status,
      admin_notes: request.admin_notes,
      resident_visible_notes: request.resident_visible_notes,
      resolution_notes: request.resolution_notes,
      created_at: request.created_at,
      updated_at: request.updated_at,
      property: {
        id: request.property.id,
        name: request.property.name,
        address: request.property.address
      },
      unit: request.unit ? {
        id: request.unit.id,
        name: request.unit.name
      } : nil,
      user: {
        id: request.user.id,
        email: request.user.email
      },
      assigned_maintenance_user: request.assigned_maintenance_user ? {
        id: request.assigned_maintenance_user.id,
        email: request.assigned_maintenance_user.email
      } : nil,
      photos: request.photos.attached? ? request.photos.map { |photo| url_for(photo) } : []
    }
  end
end

