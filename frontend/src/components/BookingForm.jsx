import React, { useState, useCallback, useMemo } from 'react'; // Added useCallback and useMemo for potential optimization
import Form from 'react-bootstrap/Form';
import { Row, Col, Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

// Define initial state outside the component to prevent re-creation on every render
// This is good practice when initial state is complex and doesn't depend on props.
const INITIAL_FORM_STATE = {
  name: '',
  lastname: '',
  email: '',
  nationality: '',
  university: '',
  birthDate: '',
  interestsId: '',
  roomId: '',
  checkIn: '',
  checkOut: '',
  comments: '',
};

function BookingForm() {
  // Using a single state object for form data makes it more manageable
  // and reduces the number of useState calls.
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading indicator

  // Centralized handleChange for a single formData object
  // Uses useCallback for memoization, which can be useful for performance
  // if this handler was passed down to many child components.
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      // Clear error for the field being changed as user types
      if (errors[name]) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  ); // Dependency array includes errors to ensure latest errors are accessed

  // Old individual handlers (like handleNameChange, etc.) are no longer needed
  // if you adopt the single formData object approach.
  // Example: <Form.Control name="name" value={formData.name} onChange={handleChange} />

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Use formData directly for validation
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
    // Add date comparison validation
    if (
      formData.checkIn &&
      formData.checkOut &&
      new Date(formData.checkIn) >= new Date(formData.checkOut)
    ) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Dependency array includes formData to ensure latest data is accessed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setErrors({}); // Clear previous form validation errors
    setIsSubmitting(true); // Set loading state

    if (validateForm()) {
      try {
        const API_URL = 'http://localhost:3001/api/v1/bookings';

        const dataToSend = {
          booking: {
            first_name: formData.name, // Map form state to Rails params
            last_name: formData.lastname,
            email: formData.email,
            nationality: formData.nationality,
            university: formData.university,
            birth_date: formData.birthDate,
            interest: formData.interestsId, // Adjust if your Rails expects interest_id
            room_type: formData.roomId, // Adjust if your Rails expects room_id
            arrival_date: formData.checkIn,
            departure_date: formData.checkOut,
            comments: formData.comments,
          },
        };

        console.log('Sending data:', dataToSend);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        const result = await response.json();

        if (response.ok) {
          console.log('Booking submitted successfully!', result);
          setFormData(INITIAL_FORM_STATE); // Reset form to initial state
          setMessage(
            'Your information has been sent successfully! Booking ID: ' +
              result.booking.id
          );
          setTimeout(() => setMessage(''), 5000);
        } else {
          // Improved error handling:
          let backendErrorMessage = 'Booking failed: Unknown error.';
          if (response.status === 422 && result.errors) {
            // Typical Rails validation error status is 422 Unprocessable Entity
            const backendErrors = Object.keys(result.errors)
              .map((key) => `${key}: ${result.errors[key].join(', ')}`)
              .join('\n');
            backendErrorMessage = `Please correct the following issues:\n${backendErrors}`;
            // Optional: Set specific errors to display under fields
            setErrors(result.errors); // Assuming result.errors structure matches your `errors` state
          } else if (result.error) {
            backendErrorMessage = result.error;
          } else {
            backendErrorMessage = `Booking failed with status ${response.status}.`;
          }
          setMessage(`Error: ${backendErrorMessage}`);
          setTimeout(() => setMessage(''), 7000); // Give users more time to read errors
          console.error('Backend errors:', result);
        }
      } catch (error) {
        console.error('Network Error or problem parsing response:', error);
        setMessage(
          'Network error: Please check your connection and ensure the backend server is running.'
        );
        setTimeout(() => setMessage(''), 7000);
      } finally {
        setIsSubmitting(false); // Always stop loading state
      }
    } else {
      // If client-side validation fails, stop loading and show client-side errors
      setIsSubmitting(false);
      setMessage('Please fix the errors in the form.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Memoize options to prevent unnecessary re-renders of select elements
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
      {/* Display general success/error messages at the top */}
      {message && (
        <p
          style={{
            color: message.startsWith('Error') ? 'red' : 'green',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '15px', // Added some margin
          }}
        >
          {message}
        </p>
      )}

      <Form
        className="pt-4 d-flex justify-content-center flex-column"
        onSubmit={handleSubmit}
      >
        {/* Each Row now uses the formData and handleChange */}
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Name</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your name"
                className="ms-3 w-50"
                name="name" // Important: Add name prop for handleChange
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Lastname</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your lastname"
                className="ms-3 w-50"
                name="lastname" // Add name prop
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Email</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                className="ms-3 w-50"
                name="email" // Add name prop
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">University</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your university"
                className="ms-3 w-50"
                name="university" // Add name prop
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Birth Date</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="date"
                placeholder="Enter your birth date"
                className="ms-3 w-50"
                name="birthDate" // Add name prop
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Interests</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Select
                name="interestsId" // Add name prop
                value={formData.interestsId}
                onChange={handleChange}
                isInvalid={!!errors.interestsId}
                className="w-50 ms-3"
              >
                {/* Dynamically render options */}
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Room</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Select
                name="roomId" // Add name prop
                value={formData.roomId}
                onChange={handleChange}
                isInvalid={!!errors.roomId}
                className="w-50 ms-3"
              >
                {/* Dynamically render options */}
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Check-in</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="date"
                placeholder="Enter check-in date"
                className="ms-3 w-50"
                name="checkIn" // Add name prop
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Check-out</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="date"
                placeholder="Enter check-out date"
                className="ms-3 w-50"
                name="checkOut" // Add name prop
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
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Comments</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter any additional comments"
                className="ms-3 w-50"
                name="comments" // Add name prop
                value={formData.comments}
                onChange={handleChange}
              />
            </Col>
          </Col>
        </Row>

        <Row className="w-100">
          <Col className="d-flex justify-content-center">
            <Button
              as="input"
              type="submit"
              className="bg-primary"
              value={isSubmitting ? 'Submitting...' : 'Submit'} // Dynamic button text
              disabled={isSubmitting} // Disable button while submitting
            />
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default BookingForm;
