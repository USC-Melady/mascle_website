// components/DashboardHeader.tsx
import React from 'react';
import { Row, Col } from 'react-bootstrap';

const DashboardHeader: React.FC = () => {
  return (
    <Row className="mb-4">
      <Col>
        <div>
          <h1 className="mb-0">Student Dashboard</h1>
          <p className="text-muted mb-0">Manage your applications and career profile</p>
        </div>
      </Col>
    </Row>
  );
};

export default DashboardHeader;