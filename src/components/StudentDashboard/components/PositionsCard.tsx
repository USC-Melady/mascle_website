// components/PositionsCard.tsx
import React from 'react';
import { Card, ListGroup, Alert, Badge, Button } from 'react-bootstrap';

interface Position {
  id: string;
  title: string;
  department: string;
  lab: string;
  professor: string;
  deadline: string;
  description: string;
  requirements: string[];
}

interface PositionsCardProps {
  positions: Position[];
}

const PositionsCard: React.FC<PositionsCardProps> = ({ positions }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-transparent py-3">
        <h5 className="mb-0">Open Positions</h5>
      </Card.Header>
      <Card.Body className="p-0">
        {positions.length === 0 ? (
          <Alert variant="light" className="m-3 mb-0">
            No open positions available at the moment.
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {positions.map((position) => (
              <ListGroup.Item key={position.id} className="py-3 px-4 border-bottom">
                <div className="d-sm-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{position.title}</h6>
                    <p className="text-muted mb-0 small">
                      {position.lab} • Prof. {position.professor} • Deadline: {position.deadline}
                    </p>
                  </div>
                  <Badge bg="success" className="mt-2 mt-sm-0">
                    Open
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      <Card.Footer className="bg-transparent py-3">
        <Button variant="outline-primary" size="sm">View All Positions</Button>
      </Card.Footer>
    </Card>
  );
};

export default PositionsCard;