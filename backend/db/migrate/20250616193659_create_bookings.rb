class CreateBookings < ActiveRecord::Migration[7.2]
  def change
    create_table :bookings do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :nationality
      t.string :university
      t.date :birth_date
      t.text :interest
      t.string :room_type
      t.date :arrival_date
      t.date :departure_date
      t.text :comments

      t.timestamps
    end
    add_index :bookings, :email, unique: true
  end
end
