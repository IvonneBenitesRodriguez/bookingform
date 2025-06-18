# config/routes.rb

Rails.application.routes.draw do
  root to: proc { [ 200, {}, [ '{"message": "API is live!"}' ] ] } # This is a simple root route that returns a welcome message
  # For your API endpoints
  namespace :api do
    namespace :v1 do
      resources :bookings, only: [ :create, :index ] # Defines POST /bookings and GET /bookings
      # Add other resources as needed, e.g., 'resources :users'
      match "*path", to: "application#handle_options_request", via: :options
    end
  end

  # Define a root path if you want to access your React app from the Rails server
  # root "rails/welcome#index" # This is the default Rails welcome page
  # You might want to remove or comment out this line if you have a frontend served separately
  # or you can define it to redirect to your React app later if needed.
end
