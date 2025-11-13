# config/initializers/cors.rb

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept API requests from the frontend.
# Read more: https://github.com/cyu/rack-cors
puts "DEBUG: config/initializers/cors.rb is being loaded!"
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # It is important to define all allowed origins here as a comma-separated list.
    # Check always the React app's terminal output (when running 'npm start')
    # to confirm the exact localhost port it's using (usually 3000).
    origins "http://localhost:3007", # the local React dev server
            "http://localhost:3001",
            "https://ivonnebenitesrodriguez.github.io", #  GitHub Pages domain
            "https://ivonnebenitesrodriguez.github.io/bookingform/"

    resource "*", # This applies the CORS settings to all paths on the API 
      headers: :any, # Allow any headers
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ], # Allow these HTTP methods
      credentials: true # Allow sending of cookies/credentials (e.g., for user authentication)
  end

  # It is possible to add more 'allow' blocks for other origins if needed
  # allow do
  #   origins 'another-frontend-domain.com'
  #   resource '/api/*',
  #     headers: :any,
  #     methods: [:get, :post]
  # end
end
