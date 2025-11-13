# config/routes.rb

Rails.application.routes.draw do
  root to: proc { [ 200, {}, [ '{"message": "API is live!"}' ] ] } # This is a simple root route that returns a welcome message
  # For the API endpoints
  namespace :api do
    namespace :v1 do
      resources :bookings, only: [ :create, :index ] # Defines POST /bookings and GET /bookings
      # Add other resources as needed, e.g., 'resources :users'
      match "*path", to: "application#handle_options_request", via: :options
    end
  end

 
end
