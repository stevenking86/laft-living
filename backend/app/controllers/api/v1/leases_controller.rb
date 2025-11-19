class Api::V1::LeasesController < ApplicationController
  before_action :authenticate_user

  def index
    # Get all leases for the current user through lease_tenants
    @leases = @current_user.leases.includes(:property, :unit, :rental_application)
    render json: @leases.map { |lease| lease_json(lease) }
  end

  def create
    @rental_application = @current_user.rental_applications.find_by(id: params[:rental_application_id])
    
    unless @rental_application
      render json: { error: 'Rental application not found' }, status: :not_found
      return
    end
    
    unless @rental_application.approved?
      render json: { error: 'Rental application must be approved to create a lease' }, status: :unprocessable_entity
      return
    end
    
    if @rental_application.lease.present?
      render json: { error: 'Lease already exists for this application' }, status: :unprocessable_entity
      return
    end
    
    @lease = Lease.new(
      rental_application: @rental_application,
      property: @rental_application.property,
      unit: @rental_application.unit,
      move_in_date: @rental_application.move_in_date,
      signed: true,
      signed_date: Date.today
    )
    
    if @lease.save
      # Create lease_tenant relationship
      LeaseTenant.create!(lease: @lease, user: @current_user)
      
      render json: lease_json(@lease), status: :created
    else
      render json: {
        error: 'Failed to create lease',
        errors: @lease.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def lease_json(lease)
    {
      id: lease.id,
      move_in_date: lease.move_in_date,
      move_out_date: lease.move_out_date,
      signed: lease.signed,
      signed_date: lease.signed_date,
      property: {
        id: lease.property.id,
        name: lease.property.name,
        address: lease.property.address,
        office_hours: lease.property.office_hours
      },
      unit: {
        id: lease.unit.id,
        name: lease.unit.name
      },
      rental_application: {
        id: lease.rental_application.id,
        status: lease.rental_application.status
      }
    }
  end
end

