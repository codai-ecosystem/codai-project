import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function ComponentWithFramerMotion() {
  const [showContent, setShowContent] = useState(true);

  return (
    <div>
      <h2>Memory Actions</h2>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowContent(!showContent)}
      >
        Toggle Content
      </motion.button>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <p>This is animated content</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

describe('Component With Framer Motion Test', () => {
  it('should render with framer motion components', () => {
    render(<ComponentWithFramerMotion />);
    expect(screen.getByText('Memory Actions')).toBeInTheDocument();
    expect(screen.getByText('Toggle Content')).toBeInTheDocument();
    expect(screen.getByText('This is animated content')).toBeInTheDocument();
  });
});
