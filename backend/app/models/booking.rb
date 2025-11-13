class Booking < ApplicationRecord
  # ====== Input Validation - Tampering Protection ======
  # PCI-DSS 6.5.1 - Input validation to prevent injection attacks

  # Name validations - Length limits + Format (only letters, spaces, hyphens, apostrophes)
  validates :first_name,
            presence: true,
            length: { maximum: 50, message: "is too long (maximum is 50 characters)" },
            format: { with: /\A[a-zA-ZÀ-ÿ\s\-']+\z/, message: "can only contain letters, spaces, hyphens, and apostrophes" }

  validates :last_name,
            presence: true,
            length: { maximum: 50, message: "is too long (maximum is 50 characters)" },
            format: { with: /\A[a-zA-ZÀ-ÿ\s\-']+\z/, message: "can only contain letters, spaces, hyphens, and apostrophes" }

  # Email validation - Format + Uniqueness + Length
  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            length: { maximum: 255 },
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email address" }

  # Nationality validation - Length limit
  validates :nationality,
            presence: true,
            length: { maximum: 100, message: "is too long (maximum is 100 characters)" }

  # University validation - Length limit
  validates :university,
            presence: true,
            length: { maximum: 200, message: "is too long (maximum is 200 characters)" }

  # Birth date validation
  validates :birth_date,
            presence: true

  # Interest validation - Length limit (optional field)
  validates :interest,
            length: { maximum: 100, message: "is too long (maximum is 100 characters)" },
            allow_blank: true

  # Room type validation - Allowlist (only specific values allowed)
  validates :room_type,
            presence: true,
            inclusion: {
              in: ["Luxus Room", "Affordable Room", "Tied-Budget Room", "Double Room"],
              message: "%{value} is not a valid room type"
            }

  # Date validations
  validates :arrival_date, presence: true
  validates :departure_date, presence: true

  # Comments validation - Length limit to prevent resource exhaustion
  validates :comments,
            length: { maximum: 1000, message: "is too long (maximum is 1000 characters)" },
            allow_blank: true

  # Custom validations
  validate :arrival_before_departure
  validate :arrival_date_not_in_past
  validate :birth_date_is_reasonable

  private

  # Ensure departure is after arrival
  def arrival_before_departure
    return unless arrival_date.present? && departure_date.present?

    if arrival_date >= departure_date
      errors.add(:departure_date, "must be after the arrival date")
    end
  end

  # Prevent bookings in the past
  def arrival_date_not_in_past
    return unless arrival_date.present?

    if arrival_date < Date.today
      errors.add(:arrival_date, "cannot be in the past")
    end
  end

  # Validate birth date is reasonable (between 18 and 98 years ago)
  def birth_date_is_reasonable
    return unless birth_date.present?

    min_age = 18.years.ago.to_date
    max_age = 98.years.ago.to_date

    if birth_date > min_age
      errors.add(:birth_date, "indicates age under 18. Must be at least 18 years old to book.")
    elsif birth_date < max_age
      errors.add(:birth_date, "is not valid. Please check the date.")
    end
  end
end 