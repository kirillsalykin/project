import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="max-w-2xl">
        <p className="mb-4">
          Have questions or want to get in touch? We'd love to hear from you.
        </p>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Email</h2>
            <p>contact@example.com</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Phone</h2>
            <p>+1 (555) 123-4567</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Address</h2>
            <p>123 Main Street<br />City, State 12345<br />United States</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 