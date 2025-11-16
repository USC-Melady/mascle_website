import React from 'react';
import { Container } from 'react-bootstrap';

const USC_RED = '#990000';

const styles = {
  pageContainer: {
    padding: '3rem 0',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pageTitle: {
    color: USC_RED,
    textAlign: 'center' as const,
    marginBottom: '4rem',
    fontWeight: 300,
    fontSize: '2.8rem',
    letterSpacing: '-0.5px'
  },
  sectionContainer: {
    marginBottom: '4rem'
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '2.5rem',
    fontWeight: 400,
    fontSize: '1.8rem',
    position: 'relative' as const,
  },
  sectionTitleAfter: {
    content: '',
    display: 'block',
    width: '60px',
    height: '2px',
    background: USC_RED,
    marginTop: '0.5rem'
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  },
  eventCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  eventImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const,
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  },
  placeholderImage: {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6c757d',
    fontSize: '0.9rem'
  },
  eventContent: {
    padding: '1.5rem'
  },
  eventTitle: {
    color: '#2c3e50',
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    lineHeight: 1.3
  },
  eventDate: {
    color: USC_RED,
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '1rem'
  },
  eventDescription: {
    color: '#6c757d',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    marginBottom: '1rem'
  },
  eventLocation: {
    color: '#495057',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  upcomingBadge: {
    background: '#28a745',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-block',
    marginBottom: '0.5rem'
  },
  pastBadge: {
    background: '#6c757d',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-block',
    marginBottom: '0.5rem'
  }
};

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image?: string;
  isUpcoming: boolean;
}

const EventsPage: React.FC = () => {
  const events: Event[] = [
    // Upcoming Events
    {
      id: '1',
      title: 'AI Research Symposium 2024',
      date: 'March 15, 2024',
      location: 'Ronald Tutor Campus Center, USC',
      description: 'Join us for our annual AI research symposium featuring presentations from faculty and graduate students on cutting-edge research in machine learning, computer vision, and natural language processing.',
      image: '/images/events/symposium-2024.jpg',
      isUpcoming: true
    },
    {
      id: '2',
      title: 'Industry Panel: AI in Healthcare',
      date: 'April 8, 2024',
      location: 'Viterbi School of Engineering',
      description: 'A panel discussion with industry leaders exploring the applications of artificial intelligence in healthcare, featuring experts from leading medical AI companies.',
      isUpcoming: true
    },
    {
      id: '3',
      title: 'Graduate Student Research Presentations',
      date: 'April 22, 2024',
      location: 'SAL Building, Room 101',
      description: 'Our graduate students will present their latest research findings and ongoing projects in machine learning, deep learning, and AI applications.',
      isUpcoming: true
    },
    
    // Past Events
    {
      id: '4',
      title: 'Machine Learning Workshop 2023',
      date: 'November 18, 2023',
      location: 'USC Viterbi School',
      description: 'A hands-on workshop covering the fundamentals of machine learning, featuring practical sessions on popular ML frameworks and real-world applications.',
      image: '/images/events/ml-workshop-2023.jpg',
      isUpcoming: false
    },
    {
      id: '5',
      title: 'Deep Learning Conference',
      date: 'September 14, 2023',
      location: 'Los Angeles Convention Center',
      description: 'MaSCle members presented their research at the regional deep learning conference, showcasing breakthrough work in computer vision and neural networks.',
      image: '/images/events/dl-conference-2023.jpg',
      isUpcoming: false
    },
    {
      id: '6',
      title: 'AI Ethics Seminar',
      date: 'August 25, 2023',
      location: 'Viterbi School Auditorium',
      description: 'An important discussion on the ethical implications of AI development and deployment, featuring renowned experts in AI ethics and policy.',
      isUpcoming: false
    },
    {
      id: '7',
      title: 'Student Research Showcase',
      date: 'May 12, 2023',
      location: 'MaSCle Lab',
      description: 'Our annual showcase where students present their research projects and achievements from the academic year, celebrating innovation and collaboration.',
      image: '/images/events/showcase-2023.jpg',
      isUpcoming: false
    },
    {
      id: '8',
      title: 'Industry Collaboration Kickoff',
      date: 'February 8, 2023',
      location: 'USC Campus',
      description: 'Launch event for our new industry partnerships, bringing together academic researchers and industry professionals to discuss collaborative opportunities.',
      isUpcoming: false
    }
  ];

  const upcomingEvents = events.filter(event => event.isUpcoming);
  const pastEvents = events.filter(event => !event.isUpcoming);

  const renderEvent = (event: Event) => (
    <div key={event.id} style={styles.eventCard}>
      {event.image ? (
        <img
          src={event.image}
          alt={event.title}
          style={styles.eventImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) {
              placeholder.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div
        style={{
          ...styles.placeholderImage,
          display: event.image ? 'none' : 'flex'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem', opacity: 0.4 }}>📅</div>
        <div>Event Photo</div>
      </div>
      
      <div style={styles.eventContent}>
        <div style={event.isUpcoming ? styles.upcomingBadge : styles.pastBadge}>
          {event.isUpcoming ? 'UPCOMING' : 'PAST EVENT'}
        </div>
        <h3 style={styles.eventTitle}>{event.title}</h3>
        <div style={styles.eventDate}>{event.date}</div>
        <p style={styles.eventDescription}>{event.description}</p>
        <div style={styles.eventLocation}>📍 {event.location}</div>
      </div>
    </div>
  );

  return (
    <Container style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Events</h1>
      
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>
          Upcoming Events
          <div style={styles.sectionTitleAfter}></div>
        </h2>
        <div style={styles.eventsGrid}>
          {upcomingEvents.map(renderEvent)}
        </div>
        {upcomingEvents.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
            No upcoming events scheduled at this time.
          </div>
        )}
      </div>

      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>
          Past Events
          <div style={styles.sectionTitleAfter}></div>
        </h2>
        <div style={styles.eventsGrid}>
          {pastEvents.map(renderEvent)}
        </div>
      </div>
    </Container>
  );
};

export default EventsPage;