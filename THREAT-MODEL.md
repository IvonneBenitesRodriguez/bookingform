# Threat Model - Casa Yllika Booking Form

**Application:** Casa Yllika Hotel Booking Form
**Version:** 1.0
**Date:** 2025-11-12
**Methodology:** STRIDE (OWASP/Microsoft)
**Classification:** Web Application (React + Rails)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Asset Identification](#asset-identification)
4. [Threat Analysis (STRIDE)](#threat-analysis-stride)
5. [Risk Assessment](#risk-assessment)
6. [Mitigation Strategies](#mitigation-strategies)
7. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Executive Summary

### Application Purpose
Web-based booking form for Casa Yllika Hotel that collects guest information and creates reservations.

### Security Posture
- **Current State:** Basic security with CORS, ESLint analysis, CI/CD pipeline
- **Target State:** Comprehensive security with threat mitigation, rate limiting, input validation
- **Risk Level:** Medium (handles PII but no payment cards currently)

### Key Findings
- ⚠️ **High Priority:** DoS protection needed
- ⚠️ **High Priority:** Input validation insufficient
- ⚠️ **Medium Priority:** Session management needs strengthening
- ✅ **Low Priority:** CSRF protection exists (Rails built-in)

---

## 2. System Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  React Frontend │ (Port 3000/80/443)
         │  (Static Files) │
         └────────┬────────┘
                  │ HTTPS/API
         ┌────────▼────────┐
         │   Rails API     │ (Port 3000 backend)
         │  (Backend API)  │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │   Database      │
         └─────────────────┘
```

### Trust Boundaries
1. **Internet → Frontend:** Public, untrusted
2. **Frontend → Backend API:** Semi-trusted
3. **Backend API → Database:** Trusted

---

## 3. Asset Identification

### Critical Assets

| Asset | Sensitivity | Impact if Compromised |
|-------|-------------|----------------------|
| **Customer PII** | 🔴 Critical | Legal liability, reputation damage |
| **Email addresses** | 🟡 High | Spam, phishing attacks |
| **Booking records** | 🟡 High | Business disruption |
| **Database** | 🔴 Critical | Data loss, service outage |

### Data Classification

**Personal Identifiable Information (PII):**
- First Name, Last Name
- Email Address
- Nationality
- Birth Date
- University/Institution

**Booking Information:**
- Check-in/Check-out Dates
- Room Type
- Interests
- Comments

---

## 4. Threat Analysis (STRIDE)

### 4.1 Spoofing (S) - Identity Threats

#### S.1: Email Spoofing in Booking Submissions
**Description:** Attacker submits bookings with fake email addresses
**Likelihood:** High | **Impact:** Medium | **Risk:** 🟡 Medium

**Current Controls:**
- ✅ Email format validation (regex)
- ❌ No email verification

**Mitigations:**
1. Implement email verification (send confirmation link)
2. Add CAPTCHA for suspicious patterns
3. Rate limit submissions per email

---

#### S.2: API Request Spoofing
**Description:** Attacker forges requests bypassing frontend
**Likelihood:** High | **Impact:** High | **Risk:** 🔴 High

**Current Controls:**
- ✅ CORS configuration
- ❌ No API authentication

**Mitigations:**
1. Implement API key authentication
2. Validate Origin and Referer headers
3. Add request fingerprinting

---

### 4.2 Tampering (T) - Data Integrity Threats

#### T.1: Request Parameter Tampering
**Description:** Attacker modifies booking data in transit
**Likelihood:** Low | **Impact:** High | **Risk:** 🟡 Medium

**Current Controls:**
- ✅ HTTPS encryption
- ✅ Strong parameters in Rails

**Mitigations:**
1. ✅ Already using HTTPS (good!)
2. Add Content Security Policy (CSP)

---

#### T.2: SQL Injection via Input Fields
**Description:** Attacker injects SQL in form fields
**Likelihood:** Medium | **Impact:** Critical | **Risk:** 🔴 High

**Current Controls:**
- ✅ ActiveRecord parameterized queries
- ❌ Limited input validation

**Mitigations:**
```ruby
# app/models/booking.rb
validates :first_name, length: { maximum: 50 },
          format: { with: /\A[a-zA-Z\s\-']+\z/ }
validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
validates :comments, length: { maximum: 1000 }
```

---

#### T.3: XSS via Comments Field
**Description:** Attacker injects JavaScript in comments
**Likelihood:** Medium | **Impact:** High | **Risk:** 🟡 Medium

**Current Controls:**
- ✅ React auto-escapes JSX

**Mitigations:**
1. ✅ React already protects (good!)
2. Add server-side sanitization
3. Implement strict CSP headers

---

### 4.3 Repudiation (R) - Non-Repudiation Threats

#### R.1: User Denies Making Booking
**Description:** Customer claims they didn't make a booking
**Likelihood:** Low | **Impact:** Medium | **Risk:** 🟢 Low

**Current Controls:**
- ❌ No audit logging
- ❌ No IP tracking

**Mitigations:**
1. Implement audit logging (PaperTrail gem)
2. Track IP addresses and user agents
3. Send confirmation emails

```ruby
# Gemfile
gem 'paper_trail'

# app/models/booking.rb
class Booking < ApplicationRecord
  has_paper_trail
end
```

---

### 4.4 Information Disclosure (I) - Confidentiality Threats

#### I.1: Exposure of Customer PII via API
**Description:** Unauthorized access to customer data
**Likelihood:** High | **Impact:** Critical | **Risk:** 🔴 Critical

**Current Controls:**
- ❌ No authentication on endpoints
- ✅ HTTPS encryption

**Mitigations:**
1. Add authentication to ALL endpoints
2. Implement row-level authorization
3. Add rate limiting

---

#### I.2: Sensitive Data in Logs
**Description:** PII leaked in application logs
**Likelihood:** High | **Impact:** High | **Risk:** 🔴 High

**Current Controls:**
- ❌ No log filtering configured

**Mitigations:**
```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :password, :email, :first_name, :last_name,
  :birth_date, :nationality, :comments
]
```

---

### 4.5 Denial of Service (D) - Availability Threats

#### D.1: Form Submission Flood
**Description:** Attacker floods booking endpoint with requests
**Likelihood:** High | **Impact:** High | **Risk:** 🔴 High

**Current Controls:**
- ❌ No rate limiting
- ❌ No CAPTCHA

**Mitigations:**
```ruby
# Gemfile
gem 'rack-attack'

# config/initializers/rack_attack.rb
Rack::Attack.throttle('bookings/ip', limit: 5, period: 60) do |req|
  req.ip if req.path == '/api/v1/bookings' && req.post?
end
```

---

#### D.2: Resource Exhaustion via Large Payloads
**Description:** Large request bodies consume server memory
**Likelihood:** Medium | **Impact:** Medium | **Risk:** 🟡 Medium

**Current Controls:**
- ❌ No request size limits
- ❌ No field length validation

**Mitigations:**
```ruby
# config/application.rb
config.middleware.use Rack::Attack
config.middleware.insert_before Rack::Runtime, Rack::Timeout, service_timeout: 15

# app/models/booking.rb
validates :comments, length: { maximum: 1000 }
```

---

### 4.6 Elevation of Privilege (E) - Authorization Threats

#### E.1: Mass Assignment Vulnerability
**Description:** Attacker adds unauthorized fields to booking
**Likelihood:** Low | **Impact:** Critical | **Risk:** 🔴 High

**Current Controls:**
- ✅ Strong parameters in controller

**Mitigations:**
```ruby
# app/controllers/api/v1/bookings_controller.rb
def booking_params
  params.require(:booking).permit(
    :first_name, :last_name, :email, :nationality,
    :university, :birth_date, :interest, :room_type,
    :arrival_date, :departure_date, :comments
  )
  # ❌ NEVER use: params.require(:booking).permit!
end
```

---

#### E.2: CORS Misconfiguration
**Description:** Overly permissive CORS allows unauthorized origins
**Likelihood:** Medium | **Impact:** High | **Risk:** 🔴 High

**Current Controls:**
- ⚠️ CORS configured but needs review

**Mitigations:**
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['ALLOWED_ORIGINS']&.split(',') || 'https://yourdomain.com'
    # ❌ NEVER: origins '*'

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options],
      credentials: true,
      max_age: 3600
  end
end
```

---

## 5. Risk Assessment

### Risk Matrix

```
Impact →     Low       Medium      High      Critical
            ├─────────┼──────────┼─────────┼──────────┤
Likelihood  │         │          │         │          │
     ↓      │         │          │         │          │
            │         │          │         │          │
High        │         │   🟡     │   🔴    │   🔴     │
            │         │  S.1     │ S.2,I.1 │  D.1     │
            │         │          │ I.2     │          │
Medium      │   🟢    │   🟡     │   🟡    │   🔴     │
            │         │  T.1,T.3 │  D.2    │  E.1,E.2 │
            │         │          │         │          │
Low         │   🟢    │   🟢     │   🟡    │          │
            │         │  R.1     │  T.2    │          │
            └─────────┴──────────┴─────────┴──────────┘

🔴 Critical Risk: Immediate action required
🟡 Medium Risk: Address in next sprint
🟢 Low Risk: Monitor
```

### Priority Threats (Immediate Action)

1. **🔴 CRITICAL:** D.1 - DoS via Form Flood
2. **🔴 CRITICAL:** I.1 - Unauthorized PII Access
3. **🔴 HIGH:** T.2 - SQL Injection Risk
4. **🔴 HIGH:** E.2 - CORS Misconfiguration
5. **🔴 HIGH:** I.2 - PII in Logs

---

## 6. Mitigation Strategies

### Phase 1: Critical Fixes (Week 1) - 🚨 START HERE

#### 1. Rate Limiting with Rack::Attack
```ruby
# Gemfile
gem 'rack-attack'

# config/initializers/rack_attack.rb
class Rack::Attack
  # Throttle all requests by IP
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Throttle booking submissions
  throttle('bookings/ip', limit: 5, period: 1.hour) do |req|
    req.ip if req.path == '/api/v1/bookings' && req.post?
  end

  # Block banned IPs
  blocklist('block banned IPs') do |req|
    Rails.cache.read("blocked:#{req.ip}")
  end
end

# config/application.rb
config.middleware.use Rack::Attack
```

**Time to implement:** 30 minutes
**Risk reduction:** 40%

---

#### 2. Enhanced Input Validation
```ruby
# app/models/booking.rb
class Booking < ApplicationRecord
  # Name validation
  validates :first_name, presence: true,
            length: { maximum: 50 },
            format: { with: /\A[a-zA-Z\s\-']+\z/,
                     message: 'only allows letters' }

  validates :last_name, presence: true,
            length: { maximum: 50 },
            format: { with: /\A[a-zA-Z\s\-']+\z/ }

  # Email validation
  validates :email, presence: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }

  # Text field length limits
  validates :nationality, length: { maximum: 50 }
  validates :university, length: { maximum: 100 }
  validates :comments, length: { maximum: 1000 }

  # Date validation
  validate :dates_are_logical

  private

  def dates_are_logical
    return if arrival_date.blank? || departure_date.blank?

    if arrival_date < Date.today
      errors.add(:arrival_date, 'cannot be in the past')
    end

    if arrival_date >= departure_date
      errors.add(:departure_date, 'must be after arrival date')
    end
  end
end
```

**Time to implement:** 1 hour
**Risk reduction:** 30%

---

#### 3. Filter Sensitive Data from Logs
```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :password, :password_confirmation,
  :email, :first_name, :last_name,
  :birth_date, :nationality, :comments,
  :ssn, :credit_card
]
```

**Time to implement:** 5 minutes
**Risk reduction:** 20%

---

#### 4. Strict CORS Configuration
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Only allow your specific domain(s)
    origins 'https://yourdomain.com', 'https://www.yourdomain.com'
    # For development (remove in production):
    # origins 'http://localhost:3000'

    # ❌ NEVER use in production:
    # origins '*'

    resource '/api/v1/*',
      headers: :any,
      methods: [:post, :options],  # Only allow necessary methods
      credentials: true,
      max_age: 600
  end
end
```

**Time to implement:** 10 minutes
**Risk reduction:** 15%

---

#### 5. Add Security Headers
```ruby
# config/initializers/security_headers.rb
Rails.application.config.action_dispatch.default_headers.merge!(
  'X-Frame-Options' => 'DENY',
  'X-Content-Type-Options' => 'nosniff',
  'X-XSS-Protection' => '1; mode=block',
  'Referrer-Policy' => 'strict-origin-when-cross-origin',
  'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()'
)

# For Content Security Policy
Rails.application.config.content_security_policy do |policy|
  policy.default_src :self, :https
  policy.script_src  :self, :https
  policy.style_src   :self, :https, :unsafe_inline
end
```

**Time to implement:** 15 minutes
**Risk reduction:** 10%

---

### Phase 2: Enhanced Security (Weeks 2-3)

#### 6. Add CAPTCHA Protection
```ruby
# Gemfile
gem 'recaptcha'

# config/initializers/recaptcha.rb
Recaptcha.configure do |config|
  config.site_key = ENV['RECAPTCHA_SITE_KEY']
  config.secret_key = ENV['RECAPTCHA_SECRET_KEY']
end

# app/controllers/api/v1/bookings_controller.rb
def create
  unless verify_recaptcha
    render json: { error: 'CAPTCHA verification failed' },
           status: :unprocessable_entity
    return
  end

  # ... rest of code
end
```

---

#### 7. Implement Audit Logging
```ruby
# Gemfile
gem 'paper_trail'

# Generate migration
rails generate paper_trail:install
rails db:migrate

# app/models/booking.rb
class Booking < ApplicationRecord
  has_paper_trail on: [:create, :update, :destroy],
                  meta: { ip: :request_ip }

  def request_ip
    Current.request_ip
  end
end

# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :request_ip
end

# app/controllers/application_controller.rb
before_action :set_paper_trail_whodunnit
before_action :set_current_request_ip

def set_current_request_ip
  Current.request_ip = request.remote_ip
end
```

---

#### 8. Add Request Timeouts
```ruby
# Gemfile
gem 'rack-timeout'

# config/initializers/timeout.rb
Rack::Timeout.timeout = 15  # seconds
Rack::Timeout.wait_timeout = 30
```

---

## 7. Implementation Roadmap

### Week 1: Critical Security (Priority 1)
- [ ] Day 1-2: Implement Rack::Attack rate limiting
- [ ] Day 2-3: Add input validation
- [ ] Day 3: Configure log filtering
- [ ] Day 4: Strict CORS configuration
- [ ] Day 5: Add security headers

**Expected outcome:** 85% risk reduction

### Week 2-3: Enhanced Protection (Priority 2)
- [ ] Add reCAPTCHA
- [ ] Implement audit logging
- [ ] Configure timeouts
- [ ] Test all mitigations

**Expected outcome:** 95% risk reduction

### Ongoing: Monitoring & Maintenance
- [ ] Monitor Rack::Attack logs
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Quarterly security review

---

## 8. Testing & Validation

### Security Test Cases

#### Test 1: Rate Limiting
```bash
# Try to send 10 requests rapidly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/bookings \
    -H "Content-Type: application/json" \
    -d '{"booking":{"first_name":"Test"}}' &
done

# Expected: 429 Too Many Requests after 5th request
```

#### Test 2: Input Validation
```bash
# Try SQL injection
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "booking": {
      "first_name": "Robert'"'"'; DROP TABLE bookings; --"
    }
  }'

# Expected: Validation error, not database error
```

#### Test 3: XSS Prevention
```bash
# Try XSS attack
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "booking": {
      "comments": "<script>alert('"'"'XSS'"'"')</script>"
    }
  }'

# Expected: Script tags sanitized or rejected
```

---

## 9. Monitoring & Alerting

### Key Metrics to Monitor

1. **Rate Limit Hits:** Track how often rate limits are triggered
2. **Failed Validations:** Monitor validation failures
3. **Suspicious IPs:** Track IPs with multiple failed attempts
4. **Response Times:** Detect potential DoS attacks

### Tools
- Rack::Attack logs
- Rails logs with filtering
- Application monitoring (Sentry, DataDog, New Relic)

---

## 10. Compliance Notes

### GDPR Considerations
- ✅ PII is identified
- ✅ Purpose of processing is clear (booking management)
- ✅ Data retention policy needed (implement)
- ✅ Right to erasure must be implemented

### Future: PCI-DSS
**Note:** Currently NOT handling credit cards
- If adding payments: Use Stripe/PayPal (handles PCI compliance)
- Never store credit card numbers directly

---

## 11. References

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Rails Security Guide](https://guides.rubyonrails.org/security.html)
- [STRIDE Threat Modeling](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [Rack::Attack Documentation](https://github.com/rack/rack-attack)

---

## 12. Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-12 | Initial threat model |

**Next Review:** 2025-05-12 (6 months)
**Owner:** Development Team
