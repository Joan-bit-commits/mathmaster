import { Navbar, Nav, NavLink } from 'shadcn-ui';

function NavbarComponent() {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">My App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#topics">Topics</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </Nav>
        <Nav>
          <NavLink href="#login">Login</NavLink>
          <NavLink href="#signup">Sign Up</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarComponent;