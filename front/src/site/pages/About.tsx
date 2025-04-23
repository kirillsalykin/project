import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/UIComponents';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader title="About Us" />
        <CardBody>
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4">
              We are dedicated to providing the best possible experience for our users.
              Our platform combines cutting-edge technology with user-friendly design
              to create a seamless and efficient solution.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">Our Team</h2>
            <p className="mb-4">
              Our team consists of passionate professionals who are committed to
              delivering excellence in every aspect of our service. We believe in
              continuous improvement and innovation.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">Our Values</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>User-centric design and development</li>
              <li>Continuous innovation and improvement</li>
              <li>Transparency and open communication</li>
              <li>Quality and reliability</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 