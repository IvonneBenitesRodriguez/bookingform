# frozen_string_literal: true

# ====== Security Headers Configuration ======
# PCI-DSS Requirement 6.5 - Protection against common web vulnerabilities
# OWASP Security Headers Best Practices

Rails.application.config.action_dispatch.default_headers.merge!(
  # X-Frame-Options: Prevents clickjacking attacks
  # DENY = Cannot be embedded in frame/iframe at all
  # SAMEORIGIN = Can only be embedded by same domain
  'X-Frame-Options' => 'DENY',

  # X-Content-Type-Options: Prevents MIME-sniffing attacks
  # nosniff = Browser won't try to guess content type
  'X-Content-Type-Options' => 'nosniff',

  # X-XSS-Protection: Enables browser's XSS filter
  # 1; mode=block = Enable filter and block page if attack detected
  # Note: This is legacy, CSP is better, but good for older browsers
  'X-XSS-Protection' => '1; mode=block',

  # Referrer-Policy: Controls how much referrer info is sent
  # strict-origin-when-cross-origin = Send origin only for cross-origin requests
  'Referrer-Policy' => 'strict-origin-when-cross-origin',

  # Permissions-Policy: Controls which browser features can be used
  # Deny access to geolocation, microphone, camera, etc.
  'Permissions-Policy' => 'geolocation=(), microphone=(), camera=(), payment=()',

  # X-Permitted-Cross-Domain-Policies: Adobe Flash/PDF policies
  'X-Permitted-Cross-Domain-Policies' => 'none',

  # X-Download-Options: Prevents IE from executing downloads
  'X-Download-Options' => 'noopen'
)

# Content Security Policy (CSP)
# Most important security header - prevents XSS, injection attacks
Rails.application.config.content_security_policy do |policy|
  # Define where content can be loaded from

  # default-src: Fallback for other directives
  policy.default_src :self, :https

  # script-src: Where JavaScript can be loaded from
  # :self = same origin, :https = any https source
  policy.script_src  :self, :https

  # style-src: Where CSS can be loaded from
  # unsafe-inline needed for inline styles (use sparingly)
  policy.style_src   :self, :https, :unsafe_inline

  # img-src: Where images can be loaded from
  # data: needed for inline images (base64)
  policy.img_src     :self, :https, :data

  # font-src: Where fonts can be loaded from
  policy.font_src    :self, :https, :data

  # connect-src: Where XHR, WebSocket, EventSource can connect
  policy.connect_src :self, :https

  # frame-src: Where iframes can be embedded from
  # none = no iframes allowed
  policy.frame_src   :none

  # object-src: Where plugins (Flash, Java) can be loaded from
  # none = no plugins allowed
  policy.object_src  :none

  # base-uri: Restricts URLs that can be used in <base> element
  policy.base_uri    :self

  # form-action: Where forms can submit to
  policy.form_action :self

  # frame-ancestors: Who can embed this page in frame/iframe
  # none = cannot be embedded
  policy.frame_ancestors :none

  # upgrade-insecure-requests: Automatically upgrade HTTP to HTTPS
  # Commented out for development, enable in production
  # policy.upgrade_insecure_requests true
end

# Generate CSP nonce for inline scripts (more secure than unsafe-inline)
Rails.application.config.content_security_policy_nonce_generator = ->(request) {
  SecureRandom.base64(16)
}

# Report CSP violations to this endpoint (optional)
# Rails.application.config.content_security_policy_report_only = false
# Rails.application.config.content_security_policy_nonce_directives = %w[script-src]

# Strict-Transport-Security (HSTS)
# Force HTTPS for all future requests
# Only enable in production with valid SSL certificate
if Rails.env.production?
  Rails.application.config.force_ssl = true
  Rails.application.config.ssl_options = {
    hsts: {
      expires: 1.year,
      subdomains: true,
      preload: true
    }
  }
end
