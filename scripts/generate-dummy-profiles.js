const fs = require('fs');

// Generate dummy student profiles for testing the recommendation system
const generateDummyProfiles = () => {
  const universities = [
    'University of Southern California', 'Stanford University', 'UC Berkeley', 'UCLA', 
    'MIT', 'Carnegie Mellon University', 'University of Washington', 'Georgia Tech',
    'UC San Diego', 'Cornell University', 'Columbia University', 'Harvard University'
  ];

  const degrees = [
    'Bachelor of Science', 'Master of Science', 'Doctor of Philosophy', 'Bachelor of Arts',
    'Master of Engineering', 'Bachelor of Engineering'
  ];

  const majors = [
    'Computer Science', 'Data Science', 'Machine Learning', 'Artificial Intelligence',
    'Software Engineering', 'Computer Engineering', 'Information Systems', 'Mathematics',
    'Statistics', 'Physics', 'Electrical Engineering', 'Bioengineering'
  ];

  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Uber',
    'Airbnb', 'Tesla', 'NVIDIA', 'Adobe', 'Salesforce', 'IBM', 'Intel', 'Cisco',
    'Oracle', 'VMware', 'Palantir', 'Databricks'
  ];

  const positions = [
    'Software Engineer Intern', 'Data Science Intern', 'Research Assistant', 
    'Software Developer', 'Machine Learning Engineer', 'Data Analyst', 'Research Intern',
    'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'AI Researcher',
    'Product Manager Intern', 'DevOps Engineer', 'Systems Engineer'
  ];

  const skillSets = [
    // Machine Learning & AI (reduced from majority)
    ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    ['Python', 'Scikit-learn', 'Keras', 'Neural Networks', 'Computer Vision'],
    ['R', 'Machine Learning', 'Statistical Analysis', 'Data Mining', 'Regression Analysis'],
    
    // Web Development (increased diversity)
    ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    ['TypeScript', 'Angular', 'Vue.js', 'CSS', 'HTML'],
    ['PHP', 'Laravel', 'MySQL', 'Bootstrap', 'jQuery'],
    ['Ruby', 'Ruby on Rails', 'PostgreSQL', 'Heroku', 'RSpec'],
    ['Django', 'Flask', 'SQLite', 'RESTful APIs', 'JSON'],
    
    // Backend & Systems
    ['Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'Docker'],
    ['C#', '.NET Framework', 'ASP.NET', 'SQL Server', 'Azure'],
    ['Go', 'Kubernetes', 'Microservices', 'GraphQL', 'Redis'],
    ['Rust', 'Systems Programming', 'Memory Management', 'Concurrency', 'Performance Optimization'],
    
    // Data Science & Analytics
    ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL'],
    ['R', 'Statistics', 'Data Visualization', 'Tableau', 'Power BI'],
    ['Scala', 'Apache Spark', 'Kafka', 'Hadoop', 'Big Data'],
    ['MATLAB', 'Data Analysis', 'Signal Processing', 'Mathematical Modeling', 'Statistics'],
    
    // Mobile Development
    ['Swift', 'iOS Development', 'UIKit', 'Core Data', 'Firebase'],
    ['Kotlin', 'Android Development', 'Android Studio', 'SQLite', 'Material Design'],
    ['React Native', 'Cross-platform Development', 'Expo', 'Mobile UI/UX', 'App Store Deployment'],
    ['Flutter', 'Dart', 'Cross-platform Development', 'Firebase', 'Material Design'],
    
    // Security & Networking
    ['Cybersecurity', 'Network Security', 'Penetration Testing', 'Firewalls', 'Encryption'],
    ['Blockchain', 'Ethereum', 'Smart Contracts', 'Solidity', 'Web3'],
    ['Network Administration', 'TCP/IP', 'DNS', 'VPN', 'Network Monitoring'],
    
    // Game Development
    ['Unity', 'C#', 'Game Development', '3D Modeling', 'Game Physics'],
    ['Unreal Engine', 'C++', 'Blueprint Scripting', 'Level Design', '3D Graphics'],
    
    // Hardware & Embedded Systems
    ['C++', 'Embedded Systems', 'Arduino', 'Raspberry Pi', 'IoT'],
    ['VHDL', 'FPGA', 'Digital Signal Processing', 'Hardware Design', 'Electronics'],
    ['C', 'Assembly Language', 'Real-time Systems', 'Device Drivers', 'Firmware'],
    
    // Design & UI/UX
    ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    ['Graphic Design', 'Photoshop', 'Illustrator', 'InDesign', 'Branding'],
    
    // DevOps & Cloud
    ['DevOps', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Infrastructure as Code'],
    ['AWS', 'EC2', 'S3', 'Lambda', 'CloudFormation'],
    ['Google Cloud Platform', 'Compute Engine', 'BigQuery', 'Kubernetes Engine', 'Cloud Functions'],
    
    // Emerging Technologies
    ['Quantum Computing', 'Qiskit', 'Mathematical Physics', 'Linear Algebra', 'Algorithm Design'],
    ['Augmented Reality', 'Virtual Reality', 'ARKit', 'Unity', '3D Graphics'],
    ['Robotics', 'ROS', 'Computer Vision', 'Sensor Fusion', 'Motion Planning']
  ];

  const seniorities = ['freshman', 'sophomore', 'junior', 'senior', 'masters'];

  const careerGoals = [
    'Pursuing research in machine learning algorithms and their applications in healthcare',
    'Developing scalable web applications and improving user experience',
    'Working on computer vision projects for autonomous vehicles',
    'Exploring natural language processing and conversational AI',
    'Building data pipelines and analytics platforms for business intelligence',
    'Researching quantum computing applications in optimization problems',
    'Creating mobile applications that solve real-world problems',
    'Developing distributed systems and cloud infrastructure',
    'Working on reinforcement learning for robotics applications',
    'Pursuing cybersecurity research and developing secure systems',
    'Building recommendation systems and personalization algorithms',
    'Researching bioinformatics and computational biology',
    'Developing blockchain and cryptocurrency technologies',
    'Working on augmented reality and virtual reality applications',
    'Creating AI solutions for climate change and environmental sustainability'
  ];

  const profiles = [];

  for (let i = 1; i <= 15; i++) {
    const randomSkills = skillSets[Math.floor(Math.random() * skillSets.length)];
    const additionalSkills = ['Git', 'Agile', 'Problem Solving', 'Communication', 'Teamwork'];
    const allSkills = [...randomSkills, ...additionalSkills.slice(0, 2)];

    // Generate 1-3 education entries
    const educationCount = Math.floor(Math.random() * 3) + 1;
    const education = [];
    for (let j = 0; j < educationCount; j++) {
      const gradYear = 2024 + Math.floor(Math.random() * 3) - j;
      education.push({
        institution: universities[Math.floor(Math.random() * universities.length)],
        degree: degrees[Math.floor(Math.random() * degrees.length)],
        major: majors[Math.floor(Math.random() * majors.length)],
        graduationDate: `${gradYear}-05-15`,
        gpa: (3.0 + Math.random() * 1.0).toFixed(2)
      });
    }

    // Generate 0-4 experience entries
    const experienceCount = Math.floor(Math.random() * 5);
    const experience = [];
    for (let j = 0; j < experienceCount; j++) {
      const startYear = 2020 + Math.floor(Math.random() * 4);
      const endYear = startYear + Math.floor(Math.random() * 2) + 1;
      experience.push({
        company: companies[Math.floor(Math.random() * companies.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        startDate: `${startYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
        endDate: `${endYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
        description: `Worked on various projects involving ${randomSkills.slice(0, 3).join(', ')} and contributed to team success.`
      });
    }

    // Generate resume description based on skills and experience
    const generateResumeDescription = (skills, experience, education) => {
      const skillsText = skills.slice(0, 5).join(', ');
      const hasExperience = experience.length > 0;
      const primaryEducation = education[0];
      
      const descriptions = [
        `Experienced ${primaryEducation.major.toLowerCase()} student with expertise in ${skillsText}. ${hasExperience ? `Previous experience includes ${experience[0].position.toLowerCase()} at ${experience[0].company}.` : 'Strong academic background with hands-on project experience.'}`,
        
        `${primaryEducation.degree} candidate specializing in ${primaryEducation.major} with proficiency in ${skillsText}. ${hasExperience ? `Proven track record in industry roles including ${experience.map(e => e.position).join(', ')}.` : 'Passionate about applying theoretical knowledge to real-world problems.'}`,
        
        `Motivated student pursuing ${primaryEducation.degree} in ${primaryEducation.major}. Technical skills include ${skillsText}. ${hasExperience ? `Industry experience spans ${Math.max(1, Math.floor(yearsOfExperience))} year${Math.floor(yearsOfExperience) !== 1 ? 's' : ''} with roles in ${[...new Set(experience.map(e => e.company))].join(', ')}.` : 'Eager to contribute to innovative research and development projects.'}`,
        
        `Dedicated ${primaryEducation.major.toLowerCase()} student with strong foundation in ${skillsText}. ${hasExperience ? `Professional experience includes ${experience.slice(0, 2).map(e => `${e.position} at ${e.company}`).join(' and ')}.` : 'Committed to continuous learning and professional growth through research opportunities.'}`
      ];
      
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    // Calculate years of experience
    let totalMonths = 0;
    for (const exp of experience) {
      const start = new Date(exp.startDate);
      const end = new Date(exp.endDate);
      totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    }
    const yearsOfExperience = Math.round((totalMonths / 12) * 10) / 10;

    const profile = {
      userId: `student_${i.toString().padStart(3, '0')}`,
      email: `student${i}@usc.edu`,
      education,
      experience,
      skills: allSkills,
      seniority: seniorities[Math.floor(Math.random() * seniorities.length)],
      yearsOfExperience,
      careerGoals: careerGoals[Math.floor(Math.random() * careerGoals.length)],
      resume_description: generateResumeDescription(allSkills, experience, education),
      profileComplete: Math.random() > 0.2, // 80% complete profiles
      lastUpdated: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      labIds: Math.random() > 0.5 ? [`lab_${Math.floor(Math.random() * 5) + 1}`] : []
    };

    profiles.push(profile);
  }

  return profiles;
};

// Generate CSV format
const generateCSV = (profiles) => {
  const headers = [
    'userId', 'email', 'seniority', 'yearsOfExperience', 'careerGoals', 'resume_description',
    'skills', 'education_institutions', 'education_degrees', 'education_majors',
    'experience_companies', 'experience_positions', 'profileComplete', 'lastUpdated'
  ];

  const csvRows = profiles.map(profile => {
    return [
      profile.userId,
      profile.email,
      profile.seniority,
      profile.yearsOfExperience,
      `"${profile.careerGoals.replace(/"/g, '""')}"`, // Escape quotes
      `"${profile.resume_description.replace(/"/g, '""')}"`, // Escape quotes
      `"${profile.skills.join(', ')}"`,
      `"${profile.education.map(e => e.institution).join(', ')}"`,
      `"${profile.education.map(e => e.degree).join(', ')}"`,
      `"${profile.education.map(e => e.major).join(', ')}"`,
      `"${profile.experience.map(e => e.company).join(', ')}"`,
      `"${profile.experience.map(e => e.position).join(', ')}"`,
      profile.profileComplete,
      profile.lastUpdated
    ].join(',');
  });

  return [headers.join(','), ...csvRows].join('\n');
};

// Main execution
const profiles = generateDummyProfiles();

// Save as JSON
fs.writeFileSync('dummy-student-profiles.json', JSON.stringify(profiles, null, 2));
console.log('✅ Generated dummy-student-profiles.json with', profiles.length, 'profiles');

// Save as CSV
const csvContent = generateCSV(profiles);
fs.writeFileSync('dummy-student-profiles.csv', csvContent);
console.log('✅ Generated dummy-student-profiles.csv with', profiles.length, 'profiles');

console.log('\n📊 Sample Profile:');
console.log(JSON.stringify(profiles[0], null, 2));

console.log('\n📈 Summary:');
console.log(`- Total profiles: ${profiles.length}`);
console.log(`- Complete profiles: ${profiles.filter(p => p.profileComplete).length}`);
console.log(`- Profiles with experience: ${profiles.filter(p => p.experience.length > 0).length}`);
console.log(`- Average years of experience: ${(profiles.reduce((sum, p) => sum + p.yearsOfExperience, 0) / profiles.length).toFixed(2)}`);

// Example API endpoint usage
console.log('\n🔗 API Endpoint Usage:');
console.log('GET /profiles/recommendation - Returns all profiles (JSON format)');
console.log('GET /profiles/recommendation?format=csv - Returns CSV format');
console.log('GET /profiles/recommendation?includeIncomplete=true - Include incomplete profiles');
console.log('\nExample response structure:');
console.log(`{
  "profiles": [...],
  "count": ${profiles.length},
  "metadata": {
    "includeIncompleteProfiles": false,
    "filterApplied": true,
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}`); 