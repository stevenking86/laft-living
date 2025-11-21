class ApplicationController < ActionController::API
  include ActiveStorage::SetCurrent
  
  # API controllers don't need CSRF protection
  # protect_from_forgery is not available in ActionController::API
  
  private
  
  def authenticate_user
    @current_user = User.find_by(id: session[:user_id])
    
    unless @current_user
      render json: {
        error: 'Authentication required'
      }, status: :unauthorized
    end
  end
  
  def authorize_property_admin!
    authenticate_user
    unless @current_user.property_admin? || @current_user.super_admin?
      render json: {
        error: 'Property admin access required'
      }, status: :forbidden
    end
  end
  
  def authorize_maintenance!
    authenticate_user
    unless @current_user.maintenance? || @current_user.super_admin?
      render json: {
        error: 'Maintenance user access required'
      }, status: :forbidden
    end
  end
  
  def authorize_super_admin!
    authenticate_user
    unless @current_user.super_admin?
      render json: {
        error: 'Super admin access required'
      }, status: :forbidden
    end
  end
  
  def accessible_properties
    @current_user&.accessible_properties || []
  end
end
