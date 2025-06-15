import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Row, Col, Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

function BookingForm() {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [university, setUniversity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [interestsId, setInterestsId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [comments, setComments] = useState('');

  const [errors, setErrors] = useState({});

  const handleNameChange = (e) => setName(e.target.value);
  const handleLastnameChange = (e) => setLastname(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNationalityChange = (e) => setNationality(e.target.value);
  const handleUniversityChange = (e) => setUniversity(e.target.value);
  const handleBirthDateChange = (e) => setBirthDate(e.target.value);
  const handleInterestsIdChange = (e) => setInterestsId(e.target.value);
  const handleRoomIdChange = (e) => setRoomId(e.target.value);
  const handleCheckInChange = (e) => setCheckIn(e.target.value);
  const handleCheckOutChange = (e) => setCheckOut(e.target.value);
  const handleCommentsChange = (e) => setComments(e.target.value);

  const validateForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = 'Name is required';
    if (!lastname) newErrors.lastname = 'Lastname is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!nationality) newErrors.nationality = 'Nationality is required';
    if (!university) newErrors.university = 'University name is required';
    if (!birthDate) newErrors.birthDate = 'Birth date is required';
    if (!interestsId) newErrors.interestsId = 'Please select your interests';
    if (!roomId) newErrors.roomId = 'Please select a room';
    if (!checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!checkOut) newErrors.checkOut = 'Check-out date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: {
              name,
              lastname,
              email,
              nationality,
              university,
              birthDate,
              interest_id: [interestsId],
              room_id: [roomId],
              checkIn,
              checkOut,
              comments,
            },
          }),
        });
        const result = await response.json();
        if (response.ok) {
          alert('Booking successful!');
        } else {
          alert('Booking failed: ' + result.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Server Error!');
      }
    }
  };
  return (
    <Container>
      <Form
        className="pt-4 d-flex justify-content-center flex-column"
        onSubmit={handleSubmit}
      >
        <Row className="mb-3 w-100">
          <Col className="d-flex justify-content-center align-items-center">
            <Form.Label className="w-25 text-end">Name</Form.Label>
            <Col className="ms-3 w-50">
              <Form.Control
                type="text"
                placeholder="Enter your name"
                className="ms-3 w-50"
                value={name}
                onChange={handleNameChange}
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
                value={lastname}
                onChange={handleLastnameChange}
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
                value={email}
                onChange={handleEmailChange}
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
                value={university}
                onChange={handleUniversityChange}
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
                value={birthDate}
                onChange={handleBirthDateChange}
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
                value={interestsId}
                onChange={handleInterestsIdChange}
                isInvalid={!!errors.interestsId}
                className="w-50 ms-3"
              >
                <option value="">Select your interests</option>
                <option value="1">Local Gastronomy</option>
                <option value="2">Local Trips</option>
                <option value="3">Out-door Sport Activities </option>
                <option value="4">Spanish learning</option>
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
                value={roomId}
                onChange={handleRoomIdChange}
                isInvalid={!!errors.roomId}
                className="w-50 ms-3"
              >
                <option value="">Select a room</option>
                <option value="1">Luxus Room</option>
                <option value="2">Affordable Room</option>
                <option value="3">Tied-Budget Room</option>
                <option value="4">Double Room</option>
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
                value={checkIn}
                onChange={handleCheckInChange}
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
                value={checkOut}
                onChange={handleCheckOutChange}
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
                value={comments}
                onChange={handleCommentsChange}
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
              value="Submit"
            />
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default BookingForm;
