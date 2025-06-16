# config/initializers/cors.rb

# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept API requests from your frontend.
# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Define all allowed origins here as a comma-separated list.
    # Check your React app's terminal output (when you run 'npm start')
    # to confirm the exact localhost port it's using (usually 3000).
    origins "http://localhost:3007", # Your local React dev server
            "https://ivonnebenitesrodriguez.github.io" # Your GitHub Pages domain

    resource "*", # This applies the CORS settings to all paths on your API
      headers: :any, # Allow any headers
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ], # Allow these HTTP methods
      credentials: true # Allow sending of cookies/credentials (e.g., for user authentication)
  end

  # You can add more 'allow' blocks for other origins if needed
  # allow do
  #   origins 'another-frontend-domain.com'
  #   resource '/api/*',
  #     headers: :any,
  #     methods: [:get, :post]
  # end
end