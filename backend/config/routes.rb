Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create, :update, :destroy]
      resources :units, only: [:index, :show]
      resources :leases, only: [:index, :create]
      resources :rental_applications, only: [:index, :create, :show] do
        resources :verifications, only: [:create, :show] do
          collection do
            get :show_by_application
          end
          member do
            post :verify
          end
        end
      end
      
      # Authentication routes
      post 'auth/login', to: 'auth#login'
      post 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'
    end
  end
end
