# app/controllers/api/v1/bookings_controller.rb
module Api
  module V1
    class BookingsController < ApplicationController
      skip_before_action :verify_authenticity_token, only: [ :create ]
      # POST /api/v1/bookings
      # This action will receive the form data from your React frontend
      def create
        @booking = Booking.new(booking_params) # Create a new Booking instance with permitted params

        if @booking.save
          # If saved successfully, send a JSON response with the created booking
          render json: { message: "Booking created successfully!", booking: @booking }, status: :created
        else
          # If validation fails, send a JSON response with error messages
          render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/bookings
      # This action would allow you to fetch all bookings (e.g., for an admin view)
      def index
        @bookings = Booking.all
        render json: @bookings
      end

      private

      # Strong Parameters: This method whitelists the parameters that are allowed
      # to be saved to the Booking model from the frontend request.
      def booking_params
        params.require(:booking).permit(
          :first_name,
          :last_name,
          :email,
          :nationality,
          :university,
          :birth_date,
          :interest,
          :room_type,
          :arrival_date,
          :departure_date,
          :comments
        )
      end
    end
  end
end
