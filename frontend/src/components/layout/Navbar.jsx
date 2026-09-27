import React from 'react';
import Header from '../header/Header.jsx';

/**
 * Navbar component adapter.
 * Re-exports the newly designed modular Header component for seamless backwards compatibility.
 */
export default function Navbar(props) {
  return <Header {...props} />;
}
