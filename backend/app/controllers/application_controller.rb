class ApplicationController < ActionController::API
  # API controllers don't need CSRF protection
  # protect_from_forgery is not available in ActionController::API
end
