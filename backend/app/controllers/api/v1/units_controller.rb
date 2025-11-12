class Api::V1::UnitsController < ApplicationController
  before_action :authenticate_user

  def index
    @units = Unit.available.includes(:property)
    render json: @units.map { |unit| unit_json(unit) }
  end

  def show
    @unit = Unit.includes(:property, :unit_monthly_prices).find(params[:id])
    render json: unit_json(@unit)
  end

  private

  def unit_json(unit)
    {
      id: unit.id,
      name: unit.name,
      property: {
        id: unit.property.id,
        name: unit.property.name,
        address: unit.property.address,
        office_hours: unit.property.office_hours,
        pets_allowed: unit.property.pets_allowed,
        has_parking: unit.property.has_parking
      },
      available: unit.available?,
      current_lease: unit.current_lease ? {
        id: unit.current_lease.id,
        move_in_date: unit.current_lease.move_in_date,
        move_out_date: unit.current_lease.move_out_date,
        signed: unit.current_lease.signed
      } : nil,
      unit_monthly_prices: unit.unit_monthly_prices.map { |ump| {
        id: ump.id,
        term: ump.term,
        price: ump.price.to_f
      }}
    }
  end
end
