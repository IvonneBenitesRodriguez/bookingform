# frozen_string_literal: true

# ====== Parameter Filtering Configuration ======
# Information Disclosure Protection - PCI-DSS Requirement 6.5.3
# Prevents sensitive data from appearing in logs
# Threat Model: I.2 - Sensitive Data in Logs (Risk: High)

# Restart the server when this file is modified.

# Configure parameters to be partially matched (e.g. passw matches password) and filtered from the log file.
# Use this to limit dissemination of sensitive information.
# See the ActiveSupport::ParameterFilter documentation for supported notations and behaviors.

Rails.application.config.filter_parameters += [
  # Personal Identifiable Information (PII) - Booking Form Data
  :email,
  :first_name,
  :last_name,
  :birth_date,
  :nationality,
  :university,
  :interest,
  :comments,

  # Booking Details - May contain sensitive timing information
  :arrival_date,
  :departure_date,
  :room_type,

  # Authentication & Security (current and future)
  :passw,
  :password,
  :password_confirmation,
  :secret,
  :token,
  :_key,
  :crypt,
  :salt,
  :certificate,
  :otp,
  :ssn,

  # Payment Information (if added in future)
  :credit_card,
  :card_number,
  :cvv,
  :cvc,
  :ccv,

  # Generic sensitive patterns - Regex patterns for flexible matching
  /\bapi[_-]?key\b/i,
  /\bauth[_-]?token\b/i,
  /\baccess[_-]?token\b/i
]

# Additional configuration for query string filtering
# Prevents sensitive data in URLs from being logged
Rails.application.config.filter_redirect += [
  :email,
  :token,
  :api_key,
  :password
]
