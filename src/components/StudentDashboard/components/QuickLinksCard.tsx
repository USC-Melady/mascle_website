// components/QuickLinksCard.tsx
import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { QuickLinksCardProps } from '../types';

const QuickLinksCard: React.FC<QuickLinksCardProps> = ({ quickLinks }) => {
  return (
    <Card className="shadow-sm border-0">
      <Card.Header 
        className="py-3"
        style={{ 
          background: 'linear-gradient(135deg, #495057, #6c757d)',
          color: 'white',
          borderRadius: '0.375rem 0.375rem 0 0'
        }}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-lightning me-2"></i>
          <h5 className="mb-0">Quick Actions</h5>
        </div>
      </Card.Header>
      <ListGroup variant="flush">
        {quickLinks.map((link, index) => (
          <ListGroup.Item 
            key={index}
            action 
            className="py-3 px-4 border-0"
            onClick={link.onClick}
            style={{ 
              transition: 'all 0.2s ease',
              borderLeft: '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderLeftColor = '#990000';
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderLeftColor = 'transparent';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(153, 0, 0, 0.1)',
                  color: '#990000'
                }}
              >
                <i className={`bi ${link.icon}`}></i>
              </div>
              <span className="fw-medium">{link.text}</span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default QuickLinksCard;