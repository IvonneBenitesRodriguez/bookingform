# config/initializers/cors.rb

# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept API requests from your frontend.
# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # During local development, your React app runs on a specific port (usually 3000 or 3001)
    # Make sure this matches the actual URL where your React development server is running.
    # If your React app is on localhost:3000, use 'http://localhost:3000'
    # If your React app is on localhost:3001, use 'http://localhost:3001'
    # Check your React app's terminal output when you run 'npm start' to confirm the port.
    origins "http://localhost:3000" # <--- IMPORTANT: Adjust this if your React dev server uses a different port!

    # For your deployed frontend on GitHub Pages:
    origins "https://ivonnebenitesrodriguez.github.io/bookingform/"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options ],
      credentials: true # Set to true if your frontend needs to send cookies/credentials (e.g., for user authentication)
  end

  # You can add more 'allow' blocks for other origins if needed
  # allow do
  #   origins 'another-frontend-domain.com'
  #   resource '/api/*',
  #     headers: :any,
  #     methods: [:get, :post]
  # end
end