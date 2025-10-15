class ApplicationController < ActionController::API
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
end
