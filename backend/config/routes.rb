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
      
      # Payment routes
      get 'payments/outstanding', to: 'payments#outstanding'
      get 'payments/last_paid', to: 'payments#last_paid'
      post 'payments/create_intent', to: 'payments#create_intent'
      post 'payments/confirm', to: 'payments#confirm'
      
      # Maintenance request routes
      resources :maintenance_requests, only: [:index, :show, :create, :update] do
        collection do
          get :maintenance_users
        end
        member do
          post :add_photos
          patch :update_resolution
        end
      end
      
      # Loyalty routes
      resources :loyalty, only: [:index]
    end
  end
end
