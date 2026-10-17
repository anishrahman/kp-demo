import React from 'react';

/**
 * Toast component matching demo's .toast styling.
 */
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      className="toast"
      style={{ display: 'block' }}
      role="status"
    >
      {message}
    </div>
  );
}
