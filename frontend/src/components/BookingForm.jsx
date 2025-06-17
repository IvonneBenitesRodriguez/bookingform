import React, { useState, useCallback, useMemo } from 'react';
import Form from 'react-bootstrap/Form';
import { Row, Col, Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

// Define initial state outside the component to prevent re-creation on every render
const INITIAL_FORM_STATE = {
  name: '',
  lastname: '',
  email: '',
  nationality: '',
  university: '',
  birthDate: '',
  interestsId: '', // Represents the selected interest
  roomId: '', // Represents the selected room
  checkIn: '',
  checkOut: '',
  comments: '',
};

function BookingForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handles changes for all form inputs using the 'name' attribute
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      // Clear specific error for the field being changed
      if (errors[name]) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors] // Dependency array: ensures the latest 'errors' state is used for clearing errors
  );

  // Client-side validation logic
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.lastname) newErrors.lastname = 'Lastname is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.nationality)
      newErrors.nationality = 'Nationality is required'; // This was the last identified error!
    if (!formData.university)
      newErrors.university = 'University name is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!formData.interestsId)
      // This checks if a non-empty option was selected
      newErrors.interestsId = 'Please select your interests';
    if (!formData.roomId)
      // This checks if a non-empty option was selected
      newErrors.roomId = 'Please select a room';
    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    // Date comparison validation
    if (
      formData.checkIn &&
      formData.checkOut &&
      new Date(formData.checkIn) >= new Date(formData.checkOut)
    ) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }

    // --- DEBUG LOG: Shows what errors were found during this validation run ---
    console.log('Errors found during validation:', newErrors);

    setErrors(newErrors); // Update the errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  }, [formData]); // Dependency array: ensures the latest 'formData' is used for validation

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setMessage(''); // Clear any previous general messages
    setErrors({}); // Clear previous validation errors from the form fields
    setIsSubmitting(true); // Set submitting state for UI feedback (e.g., disable button)

    if (validateForm()) {
      // Run client-side validation
      // --- DEBUG LOGS: These will only show if client-side validation passes ---
      console.log(
        'Form is valid according to client-side validation. Proceeding to submit data.'
      );
      console.log('Final data to send:', formData);

      try {
        const API_URL = 'http://localhost:3000/api/v1/bookings'; // Your Rails API endpoint

        // Prepare data to send to Rails backend (snake_case keys for Rails)
        const dataToSend = {
          booking: {
            first_name: formData.name,
            last_name: formData.lastname,
            email: formData.email,
            nationality: formData.nationality,
            university: formData.university,
            birth_date: formData.birthDate,
            interest: formData.interestsId, // Map to 'interest' or 'interest_id' as per your Rails model
            room_type: formData.roomId, // Map to 'room_type' or 'room_id' as per your Rails model
            arrival_date: formData.checkIn,
            departure_date: formData.checkOut,
            comments: formData.comments,
          },
        };

        console.log('Sending data:', dataToSend); // Confirm data structure before fetch

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Indicate JSON payload
            Accept: 'application/json', // Expect JSON response
          },
          body: JSON.stringify(dataToSend), // Convert JS object to JSON string
        });

        const result = await response.json(); // Parse the JSON response from the server

        if (response.ok) {
          // Check if the response status is 2xx (success)
          console.log('Booking submitted successfully!', result);
          setFormData(INITIAL_FORM_STATE); // Reset form fields on successful submission
          setMessage(
            'Your information has been sent successfully! Booking ID: ' +
              result.booking.id
          );
          setTimeout(() => setMessage(''), 5000); // Clear success message after 5 seconds
        } else {
          // Handle API errors (e.g., 422 Unprocessable Entity for validation errors)
          let backendErrorMessage = 'Booking failed: Unknown error.';
          if (response.status === 422 && result.errors) {
            // If Rails returns validation errors, format them for display
            const backendErrors = Object.keys(result.errors)
              .map((key) => `${key}: ${result.errors[key].join(', ')}`)
              .join('\n');
            backendErrorMessage = `Please correct the following issues:\n${backendErrors}`;
            // Optional: Set specific errors to display under fields from backend
            setErrors(result.errors); // Assuming result.errors matches your `errors` state keys
          } else if (result.error) {
            // General error message from backend
            backendErrorMessage = result.error;
          } else {
            backendErrorMessage = `Booking failed with status ${response.status}.`;
          }
          setMessage(`Error: ${backendErrorMessage}`); // Display backend error
          setTimeout(() => setMessage(''), 7000); // Clear error message after 7 seconds
          console.error('Backend errors:', result); // Log full backend error for debugging
        }
      } catch (error) {
        // Handle network errors (e.g., server not running, no internet)
        console.error('Network Error or problem parsing response:', error);
        setMessage(
          'Network error: Please check your connection and ensure the backend server is running.'
        );
        setTimeout(() => setMessage(''), 7000);
      } finally {
        setIsSubmitting(false); // Always reset submitting state
      }
    } else {
      // If client-side validation fails, stop loading and display message
      setIsSubmitting(false);
      setMessage('Please fix the errors in the form.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Memoized options for "Interests" dropdown to optimize performance
  const interestOptions = useMemo(
    () => [
      { value: '', label: 'Select your interests' }, // Default "empty" option
      { value: 'Local Gastronomy', label: 'Local Gastronomy' },
      { value: 'Local Trips', label: 'Local Trips' },
      {
        value: 'Out-door Sport Activities',
        label: 'Out-door Sport Activities',
      },
      { value: 'Spanish learning', label: 'Spanish learning' },
    ],
    []
  );

  // Memoized options for "Room" dropdown to optimize performance
  const roomOptions = useMemo(
    () => [
      { value: '', label: 'Select a room' }, // Default "empty" option
      { value: 'Luxus Room', label: 'Luxus Room' },
      { value: 'Affordable Room', label: 'Affordable Room' },
      { value: 'Tied-Budget Room', label: 'Tied-Budget Room' },
      { value: 'Double Room', label: 'Double Room' },
    ],
    []
  );

  return (
    <Container>
      {/* General message display (success or error) */}
      {message && (
        <p
          style={{
            color: message.startsWith('Error') ? 'red' : 'green',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '15px',
          }}
        >
          {message}
        </p>
      )}

      <Form
        className="pt-4 d-flex justify-content-center flex-column"
        onSubmit={handleSubmit}
      >
        {/* Name Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Name</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your name"
                className="ms-3 w-50"
                name="name" // Matches formData.name
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name} // Show invalid style if error exists
              />
              <Form.Control.Feedback type="invalid">
                {errors.name} {/* Display error message */}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Lastname Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Lastname</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your lastname"
                className="ms-3 w-50"
                name="lastname" // Matches formData.lastname
                value={formData.lastname}
                onChange={handleChange}
                isInvalid={!!errors.lastname}
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastname}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Email Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Email</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                className="ms-3 w-50"
                name="email" // Matches formData.email
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Nationality Field (The one we were debugging) */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Nationality</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your nationality"
                className="ms-3 w-50"
                name="nationality" // Matches formData.nationality
                value={formData.nationality}
                onChange={handleChange}
                isInvalid={!!errors.nationality}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nationality}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* University Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">University</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your university"
                className="ms-3 w-50"
                name="university" // Matches formData.university
                value={formData.university}
                onChange={handleChange}
                isInvalid={!!errors.university}
              />
              <Form.Control.Feedback type="invalid">
                {errors.university}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Birth Date Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Birth Date</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="date"
                placeholder="Enter your birth date"
                className="ms-3 w-50"
                name="birthDate" // Matches formData.birthDate
                value={formData.birthDate}
                onChange={handleChange}
                isInvalid={!!errors.birthDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.birthDate}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Interests Select Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Interests</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Select
                name="interestsId" // Matches formData.interestsId
                value={formData.interestsId}
                onChange={handleChange}
                isInvalid={!!errors.interestsId}
                className="w-50 ms-3"
              >
                {/* Render options dynamically from interestOptions */}
                {interestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.interestsId}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Room Select Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Room</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Select
                name="roomId" // Matches formData.roomId
                value={formData.roomId}
                onChange={handleChange}
                isInvalid={!!errors.roomId}
                className="w-50 ms-3"
              >
                {/* Render options dynamically from roomOptions */}
                {roomOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.roomId}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Check-in Date Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Check-in</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="date"
                placeholder="Enter check-in date"
                className="ms-3 w-50"
                name="checkIn" // Matches formData.checkIn
                value={formData.checkIn}
                onChange={handleChange}
                isInvalid={!!errors.checkIn}
              />
              <Form.Control.Feedback type="invalid">
                {errors.checkIn}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Check-out Date Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Check-out</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="date"
                placeholder="Enter check-out date"
                className="ms-3 w-50"
                name="checkOut" // Matches formData.checkOut
                value={formData.checkOut}
                onChange={handleChange}
                isInvalid={!!errors.checkOut}
              />
              <Form.Control.Feedback type="invalid">
                {errors.checkOut}
              </Form.Control.Feedback>
            </Col>
          </Col>
        </Row>

        {/* Comments Textarea Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Comments</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                as="textarea" // Renders as a textarea
                rows={3}
                placeholder="Enter any additional comments"
                className="ms-3 w-50"
                name="comments" // Matches formData.comments
                value={formData.comments}
                onChange={handleChange}
              />
            </Col>
          </Col>
        </Row>

        {/* Submit Button */}
        <Row className="w-100">
          <Col className="d-flex justify-content-center">
            <Button
              as="input"
              type="submit"
              className="bg-primary"
              value={isSubmitting ? 'Submitting...' : 'Submit'} // Dynamic text while submitting
              disabled={isSubmitting} // Disable button to prevent multiple submissions
            />
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default BookingForm;
