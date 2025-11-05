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

// Helper function for artificial delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
      newErrors.nationality = 'Nationality is required';
    if (!formData.university)
      newErrors.university = 'University name is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!formData.interestsId)
      newErrors.interestsId = 'Please select your interests';
    if (!formData.roomId) newErrors.roomId = 'Please select a room';
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

    console.log('Errors found during validation:', newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      setMessage('Please fix the errors in the form.');
      setTimeout(() => setMessage(''), 5000);
      return; // Stop if client-side validation fails
    }

    console.log(
      'Form is valid according to client-side validation. Proceeding to submit data.'
    );
    console.log('Final data to send:', formData);

    const API_URL = 'https://bookingform.onrender.com/api/v1/bookings';
    const MAX_RETRIES = 3; // Maximum number of retries
    const RETRY_DELAY_MS = 10000; // 10 seconds delay between retries

    // Prepare data send to Rails backend (snake_case keys for Rails)
    const dataToSend = {
      booking: {
        first_name: formData.name,
        last_name: formData.lastname,
        email: formData.email,
        nationality: formData.nationality,
        university: formData.university,
        birth_date: formData.birthDate,
        interest: formData.interestsId,
        room_type: formData.roomId,
        arrival_date: formData.checkIn,
        departure_date: formData.checkOut,
        comments: formData.comments,
      },
    };

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        setMessage(`Submitting... Attempt ${i + 1} of ${MAX_RETRIES}`);
        console.log(`Sending data (Attempt ${i + 1}):`, dataToSend);

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 60000); // Set a 60-second timeout for the fetch

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(dataToSend),
          signal: controller.signal, // Link the abort controller to the fetch request
        });

        clearTimeout(id); // Clear the timeout if fetch completes

        const result = await response.json();

        if (response.ok) {
          console.log('Booking submitted successfully!', result);
          setFormData(INITIAL_FORM_STATE);
          setMessage(
            'Your information has been sent successfully! Booking ID: ' +
              result.booking.id
          );
          setTimeout(() => setMessage(''), 5000);
          setIsSubmitting(false); // Successfully submitted, exit loop
          return;
        } else {
          let backendErrorMessage = 'Booking failed: Unknown error.';
          if (response.status === 422 && result.errors) {
            const backendErrors = Object.keys(result.errors)
              .map((key) => `${key}: ${result.errors[key].join(', ')}`)
              .join('\n');
            backendErrorMessage = `Please correct the following issues:\n${backendErrors}`;
            setErrors(result.errors);
          } else if (result.error) {
            backendErrorMessage = result.error;
          } else {
            backendErrorMessage = `Booking failed with status ${response.status}.`;
          }
          setMessage(`Error: ${backendErrorMessage}`);
          setTimeout(() => setMessage(''), 7000);
          console.error('Backend errors:', result);

          // If it's a server-side validation error (422), don't retry, it's not a network issue
          if (response.status === 422) {
            setIsSubmitting(false);
            return;
          }
        }
      } catch (error) {
        console.error(`Network Error (Attempt ${i + 1}):`, error);
        if (error.name === 'AbortError') {
          setMessage(`Request timed out (Attempt ${i + 1}). Retrying...`);
        } else {
          setMessage(
            `Network error (Attempt ${
              i + 1
            }): Please check connection. Retrying...`
          );
        }

        if (i < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY_MS); // Wait before retrying
        } else {
          // Last attempt failed
          setMessage(
            'Error: Could not connect to the server after multiple attempts. Please try again later.'
          );
          setTimeout(() => setMessage(''), 10000);
        }
      }
    }
    setIsSubmitting(false); // Ensure submitting state is reset after all retries
  };

  // Memoized options for "Interests" dropdown to optimize performance
  const interestOptions = useMemo(
    () => [
      { value: '', label: 'Select your interests' },
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
      { value: '', label: 'Select a room' },
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
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
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
                name="lastname"
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
                name="email"
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

        {/* Nationality Field */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Nationality</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your nationality"
                className="ms-3 w-50"
                name="nationality"
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
                name="university"
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
                name="birthDate"
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
                name="interestsId"
                value={formData.interestsId}
                onChange={handleChange}
                isInvalid={!!errors.interestsId}
                className="w-50 ms-3"
              >
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
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                isInvalid={!!errors.roomId}
                className="w-50 ms-3"
              >
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
                name="checkIn"
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
                name="checkOut"
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
                as="textarea"
                rows={3}
                placeholder="Enter any additional comments"
                className="ms-3 w-50"
                name="comments"
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
              className="button-submit"
              value={isSubmitting ? 'Submitting...' : 'Submit'}
              disabled={isSubmitting}
            />
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default BookingForm;
