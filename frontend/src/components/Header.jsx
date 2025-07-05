import React from 'react';
import Logo from '../assets/logo.png';
import { Container, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MdOutlineHotel } from 'react-icons/md';

const Header = () => {
  return (
    <header>
      <Navbar bg="yellow" expang="lg" className="px-3 justify-content-start">
        <Container fluid className="navbar-container">
          <Navbar.Brand href="#home">
            <img
              src={Logo}
              alt="Logo Hotel"
              height="130"
              className="d-inline-block align-top align-start"
            />
          </Navbar.Brand>
        </Container>
      </Navbar>
      <div>
        <h2 className="text-center">Casa Yllika Hotel Booking Form</h2>
      </div>
      <div className="text-center fs-4 d-flex justify-content-center">
        <MdOutlineHotel />
        <p className="ms-3 me-3">Book your stay with us</p>
        <MdOutlineHotel />
      </div>
    </header>
  );
};

export default Header;
