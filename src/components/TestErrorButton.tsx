import { useState } from 'react';

// Test component that throws error when clicked
export function TestErrorButton() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Test render error - adversarial test');
  }
  
  // Only render in development
  if (import.meta.env.PROD) {
    return null;
  }
  
  return (
    <button
      id="test-error-trigger"
      tabIndex={-1}
      onClick={() => setShouldError(true)}
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '5px 10px',
        fontSize: '12px',
        opacity: 0.3,
        pointerEvents: 'all',
        zIndex: 9999
      }}
      aria-hidden="true"
    >
      Test Error
    </button>
  );
}