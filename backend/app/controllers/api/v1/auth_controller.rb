class Api::V1::AuthController < ApplicationController
  before_action :authenticate_user, only: [:logout, :me]
  
  def login
    user = User.find_by(email: params[:email])
    
    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      render json: {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }, status: :ok
    else
      render json: {
        error: 'Invalid email or password'
      }, status: :unauthorized
    end
  end
  
  def logout
    session[:user_id] = nil
    render json: {
      message: 'Logout successful'
    }, status: :ok
  end
  
  def me
    render json: {
      user: {
        id: @current_user.id,
        email: @current_user.email,
        role: @current_user.role
      }
    }, status: :ok
  end
  
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
