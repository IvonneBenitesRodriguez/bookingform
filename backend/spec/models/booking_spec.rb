require 'rails_helper'

RSpec.describe Booking, type: :model do
  # Helper method to create a valid booking
  let(:valid_attributes) do
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      nationality: 'USA',
      university: 'MIT',
      birth_date: 20.years.ago.to_date,
      arrival_date: Date.tomorrow,
      departure_date: Date.tomorrow + 2.days,
      room_type: 'Luxus Room',
      comments: 'Looking forward to my stay'
    }
  end

  describe 'validations' do
    context 'first_name' do
      it 'is valid with valid attributes' do
        booking = Booking.new(valid_attributes)
        expect(booking).to be_valid
      end

      it 'is invalid without a first name' do
        booking = Booking.new(valid_attributes.merge(first_name: nil))
        expect(booking).to_not be_valid
        expect(booking.errors[:first_name]).to include("can't be blank")
      end

      it 'is invalid when first name exceeds 50 characters' do
        booking = Booking.new(valid_attributes.merge(first_name: 'a' * 51))
        expect(booking).to_not be_valid
        expect(booking.errors[:first_name]).to include("is too long (maximum is 50 characters)")
      end

      it 'is invalid with special characters' do
        booking = Booking.new(valid_attributes.merge(first_name: 'John<script>'))
        expect(booking).to_not be_valid
        expect(booking.errors[:first_name]).to include("can only contain letters, spaces, hyphens, and apostrophes")
      end

      it 'is valid with hyphens and apostrophes' do
        booking = Booking.new(valid_attributes.merge(first_name: "Mary-Anne"))
        expect(booking).to be_valid
      end
    end

    context 'last_name' do
      it 'is invalid without a last name' do
        booking = Booking.new(valid_attributes.merge(last_name: nil))
        expect(booking).to_not be_valid
        expect(booking.errors[:last_name]).to include("can't be blank")
      end

      it 'is invalid when last name exceeds 50 characters' do
        booking = Booking.new(valid_attributes.merge(last_name: 'b' * 51))
        expect(booking).to_not be_valid
        expect(booking.errors[:last_name]).to include("is too long (maximum is 50 characters)")
      end
    end

    context 'email' do
      it 'is invalid without an email' do
        booking = Booking.new(valid_attributes.merge(email: nil))
        expect(booking).to_not be_valid
        expect(booking.errors[:email]).to include("can't be blank")
      end

      it 'is invalid with an improperly formatted email' do
        booking = Booking.new(valid_attributes.merge(email: 'invalid_email'))
        expect(booking).to_not be_valid
        expect(booking.errors[:email]).to include("is not a valid email address")
      end

      it 'is invalid when email exceeds 255 characters' do
        long_email = "#{'a' * 250}@test.com"
        booking = Booking.new(valid_attributes.merge(email: long_email))
        expect(booking).to_not be_valid
      end

      it 'is invalid with duplicate email (case insensitive)' do
        Booking.create!(valid_attributes)
        booking = Booking.new(valid_attributes.merge(email: valid_attributes[:email].upcase))
        expect(booking).to_not be_valid
        expect(booking.errors[:email]).to include("has already been taken")
      end
    end

    context 'room_type' do
      it 'is invalid with an invalid room type' do
        booking = Booking.new(valid_attributes.merge(room_type: 'Invalid Room'))
        expect(booking).to_not be_valid
        expect(booking.errors[:room_type]).to include("Invalid Room is not a valid room type")
      end

      it 'is valid with Luxus Room' do
        booking = Booking.new(valid_attributes.merge(room_type: 'Luxus Room'))
        expect(booking).to be_valid
      end

      it 'is valid with Affordable Room' do
        booking = Booking.new(valid_attributes.merge(room_type: 'Affordable Room'))
        expect(booking).to be_valid
      end

      it 'is valid with Tied-Budget Room' do
        booking = Booking.new(valid_attributes.merge(room_type: 'Tied-Budget Room'))
        expect(booking).to be_valid
      end

      it 'is valid with Double Room' do
        booking = Booking.new(valid_attributes.merge(room_type: 'Double Room'))
        expect(booking).to be_valid
      end
    end

    context 'comments' do
      it 'is valid without comments' do
        booking = Booking.new(valid_attributes.merge(comments: nil))
        expect(booking).to be_valid
      end

      it 'is invalid when comments exceed 1000 characters' do
        booking = Booking.new(valid_attributes.merge(comments: 'a' * 1001))
        expect(booking).to_not be_valid
        expect(booking.errors[:comments]).to include("is too long (maximum is 1000 characters)")
      end
    end

    context 'birth_date' do
      it 'is invalid without a birth date' do
        booking = Booking.new(valid_attributes.merge(birth_date: nil))
        expect(booking).to_not be_valid
        expect(booking.errors[:birth_date]).to include("can't be blank")
      end

      it 'is invalid when user is under 18 years old' do
        booking = Booking.new(valid_attributes.merge(birth_date: 17.years.ago.to_date))
        expect(booking).to_not be_valid
        expect(booking.errors[:birth_date]).to include("indicates age under 18. Must be at least 18 years old to book.")
      end

      it 'is valid when user is exactly 18 years old' do
        booking = Booking.new(valid_attributes.merge(birth_date: 18.years.ago.to_date))
        expect(booking).to be_valid
      end

      it 'is invalid when birth date is more than 120 years ago' do
        booking = Booking.new(valid_attributes.merge(birth_date: 121.years.ago.to_date))
        expect(booking).to_not be_valid
        expect(booking.errors[:birth_date]).to include("is not valid. Please check the date.")
      end
    end

    context 'arrival_date and departure_date' do
      it 'is invalid when arrival date is in the past' do
        booking = Booking.new(valid_attributes.merge(arrival_date: Date.yesterday))
        expect(booking).to_not be_valid
        expect(booking.errors[:arrival_date]).to include("cannot be in the past")
      end

      it 'is valid when arrival date is today' do
        booking = Booking.new(valid_attributes.merge(arrival_date: Date.today, departure_date: Date.tomorrow))
        expect(booking).to be_valid
      end

      it 'is invalid when departure date is before arrival date' do
        booking = Booking.new(valid_attributes.merge(
          arrival_date: Date.tomorrow,
          departure_date: Date.today
        ))
        expect(booking).to_not be_valid
        expect(booking.errors[:departure_date]).to include("must be after the arrival date")
      end

      it 'is invalid when departure date is the same as arrival date' do
        booking = Booking.new(valid_attributes.merge(
          arrival_date: Date.tomorrow,
          departure_date: Date.tomorrow
        ))
        expect(booking).to_not be_valid
        expect(booking.errors[:departure_date]).to include("must be after the arrival date")
      end
    end

    context 'nationality and university' do
      it 'is invalid without nationality' do
        booking = Booking.new(valid_attributes.merge(nationality: nil))
        expect(booking).to_not be_valid
      end

      it 'is invalid when nationality exceeds 100 characters' do
        booking = Booking.new(valid_attributes.merge(nationality: 'a' * 101))
        expect(booking).to_not be_valid
      end

      it 'is invalid without university' do
        booking = Booking.new(valid_attributes.merge(university: nil))
        expect(booking).to_not be_valid
      end

      it 'is invalid when university exceeds 200 characters' do
        booking = Booking.new(valid_attributes.merge(university: 'a' * 201))
        expect(booking).to_not be_valid
      end
    end
  end
end
