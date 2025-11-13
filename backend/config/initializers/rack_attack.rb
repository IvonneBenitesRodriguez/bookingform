# frozen_string_literal: true

# ====== Rack::Attack Configuration ======
# DoS Protection - PCI-DSS Requirement 6.5 & OWASP A05:2021 Security Misconfiguration
# Protects against Denial of Service attacks by rate limiting requests

class Rack::Attack
 
  ### Throttle Configuration ###

  # Throttle all requests by IP (general rate limit)
  # Allows 300 requests per 5 minutes per IP
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip # unless req.path.start_with?('/assets')
  end

  # Throttle POST requests to /api/v1/bookings
  # Allows only 5 booking submissions per hour per IP
  # This is the CRITICAL protection against form flood attacks
  throttle('bookings/ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/v1/bookings' && req.post?
      req.ip
    end
  end

  # Throttle POST requests by email address
  # Prevents same email from being used multiple times
  throttle('bookings/email', limit: 3, period: 1.hour) do |req|
    if req.path == '/api/v1/bookings' && req.post?
      # Extract email from request body
      req.params.dig('booking', 'email').presence
    end
  end

  # Throttle login attempts (if authentication is added later)
  throttle('logins/email', limit: 5, period: 20.minutes) do |req|
    if req.path == '/login' && req.post?
      req.params['email'].to_s.downcase.gsub(/\s+/, "").presence
    end
  end

  ### Custom Throttle Response ###

  # Customize the response when a request is throttled
  self.throttled_responder = lambda do |request|
    match_data = request.env['rack.attack.match_data']
    now = match_data[:epoch_time]

    headers = {
      'Content-Type' => 'application/json',
      'RateLimit-Limit' => match_data[:limit].to_s,
      'RateLimit-Remaining' => '0',
      'RateLimit-Reset' => (now + (match_data[:period] - (now % match_data[:period]))).to_s
    }

    [429, headers, [{
      error: 'Rate limit exceeded. Please try again later.',
      retry_after: match_data[:period]
    }.to_json]]
  end

  ### Blocklists ###

  # Block suspicious IP addresses
  # It is possible to add IPs to blocklist dynamically
  blocklist('block suspicious IPs') do |req|
    # Check if IP is in blocklist (stored in Rails cache)
    Rails.cache.read("blocked:#{req.ip}")
  end

  # Block requests from known bad user agents
  blocklist('block bad user agents') do |req|
    # Customize based on the application's requirements
    req.user_agent =~ /curl|wget|python-requests|scrapy/i
  end

  ### Safelists ###

  # Always allow requests from localhost (for development)
  safelist('allow from localhost') do |req|
    req.ip == '127.0.0.1' || req.ip == '::1'
  end

  # Allow trusted IP addresses (e.g., the office IP)
  # safelist('allow from trusted IPs') do |req|
  #   ['192.168.1.1', '10.0.0.1'].include?(req.ip)
  # end

  ### Fail2Ban-like Behavior ###

  # Block IPs that make too many bad requests
  # If more than 5 requests return 401/403 in 1 minute, block for 1 hour
  Rack::Attack.blocklist('fail2ban bad requests') do |req|
    # Count failed attempts in Redis/cache
    Rack::Attack::Allow2Ban.filter(req.ip, maxretry: 5, findtime: 1.minute, bantime: 1.hour) do
      # Return true if this request should count toward banning
      CGI.unescape(req.query_string) =~ /%(\h{2})/ ||
      req.path.include?('/etc/passwd') ||
      req.path.include?('..') # Path traversal attempt
    end
  end

  ### Logging ###

  # Log blocked requests
  ActiveSupport::Notifications.subscribe(/rack_attack/) do |name, start, finish, request_id, payload|
    req = payload[:request]

    if [:throttle, :blocklist].include?(req.env['rack.attack.match_type'])
      Rails.logger.warn("[Rack::Attack][#{req.env['rack.attack.match_type']}] " \
                        "IP: #{req.ip} | " \
                        "Path: #{req.path} | " \
                        "Matched: #{req.env['rack.attack.matched']}")
    end
  end
end

# Enable Rack::Attack
Rails.application.config.middleware.use Rack::Attack
