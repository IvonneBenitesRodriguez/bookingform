class Booking < ApplicationRecord
    validates :first_name, presence: true
    validates :last_name, presence:  true
    validates :email, presence: true, uniqueness: true,  format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :nationality, presence: true
    validates :university, presence: true
    validates :birth_date, presence: true
    validates :arrival_date, presence: true
    validates :departure_date, presence: true
    validates :room_type, presence: true

    validate  :arrival_before_departure

    private

    def arrival_before_departure
        if arrival_date.present? && departure_date.present? && arrival_date >= departure_date
            errors.add(:departure_date, "must be after the arrival date")
        end
    end
end
