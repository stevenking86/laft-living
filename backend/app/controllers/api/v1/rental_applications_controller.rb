class Api::V1::RentalApplicationsController < ApplicationController
  before_action :authenticate_user

  def index
    @rental_applications = @current_user.rental_applications.includes(:property, :unit, :lease)
    render json: @rental_applications.map { |app| rental_application_json(app) }
  end

  def create
    @rental_application = RentalApplication.new(rental_application_params)
    @rental_application.user = @current_user

    if @rental_application.save
      render json: rental_application_json(@rental_application), status: :created
    else
      render json: {
        error: 'Failed to create rental application',
        errors: @rental_application.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def rental_application_params
    params.require(:rental_application).permit(
      :property_id,
      :unit_id,
      :unit_monthly_price_id,
      :move_in_date,
      :first_name,
      :middle_name,
      :last_name,
      :date_of_birth,
      :gender
    )
  end

  def rental_application_json(application)
    {
      id: application.id,
      user_id: application.user_id,
      property_id: application.property_id,
      unit_id: application.unit_id,
      unit_monthly_price_id: application.unit_monthly_price_id,
      move_in_date: application.move_in_date,
      first_name: application.first_name,
      middle_name: application.middle_name,
      last_name: application.last_name,
      date_of_birth: application.date_of_birth,
      gender: application.gender,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      has_lease: application.lease.present?,
      property: {
        id: application.property.id,
        name: application.property.name,
        address: application.property.address,
        office_hours: application.property.office_hours
      },
      unit: {
        id: application.unit.id,
        name: application.unit.name
      }
    }
  end
end

