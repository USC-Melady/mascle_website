# USC Machine Learning Center (MaSCle) - Application Setup Guide

**Last Updated:** October 15, 2025

## Table of Contents
- [About the Project](#about-the-project)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)
- [Contact Information](#contact-information)

---

## About the Project

This project addresses the challenge of efficiently matching students with research positions and provides a central platform for students and faculty to search and post jobs at the **USC Machine Learning Center (MaSCle)**.

### Abstract

The platform leverages modern web technologies (React 18, TypeScript, AWS Amplify) and advanced AI capabilities, featuring:

- **Sophisticated resume processing pipeline** using AWS Textract and Comprehend
- **Content-based recommendation system** with BERT embeddings
- **Role-based authentication** supporting multiple user types (Admin, Professor, Student)
- **AWS services integration** including Lambda functions, DynamoDB, and S3 for scalable, serverless operations

The platform demonstrates improved matching accuracy and reduced administrative overhead, showing enhanced visibility of research opportunities and better alignment between student skills and position requirements. The system's modular design and comprehensive testing framework ensure maintainability and reliability, while the intuitive user interface facilitates seamless interaction between students and faculty members.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **yarn**
   - Verify installation: `npm --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/

4. **AWS Account** (for Amplify features)
   - Required for backend functionality
   - Sign up at: https://aws.amazon.com/

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/eemokey/Mascle.git
cd Mascle
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- Emotion (Styled Components)
- React Bootstrap
- Vite
- React Router
- AWS Amplify Gen 2

**Note:** The installation process may take a few minutes depending on your internet connection.

### Step 3: Configure Environment Variables

If required, create a `.env` file in the root directory with necessary environment variables:

```bash
# Example .env file (adjust based on your setup)
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=your_user_pool_id
VITE_AWS_CLIENT_ID=your_client_id
```

**Note:** Contact the development team if you need specific environment configuration values.

---

## Running the Application

### Development Mode

To start the application in development mode with hot-reload:

```bash
npm run dev
```

The application will start on **http://localhost:5173/** (or the next available port if 5173 is in use).

You should see output similar to:
```
VITE v6.2.1  ready in 228 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Project Structure

```
Mascle/
├── amplify/                  # AWS Amplify backend configuration
│   ├── backend.ts           # Backend resource definitions
│   ├── auth/                # Authentication resources
│   ├── data/                # Data models and schemas
│   └── functions/           # Lambda functions
│       ├── createUser/
│       ├── getJobs/
│       ├── uploadResume/
│       └── ...
├── public/                   # Static assets
│   ├── images/
│   └── index.html
├── src/                      # Source code
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MainContent.tsx  # Homepage with particle animation
│   │   ├── LabsPage.tsx
│   │   └── ...
│   ├── pages/               # Page components
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Static data (people, events, etc.)
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── scripts/                  # Utility scripts
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # Original README
```

---

## Technology Stack

### Frontend
- **React 18.3.1** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Vite 6.0.5** - Fast build tool and dev server
- **Emotion** - CSS-in-JS styling library
- **React Bootstrap** - UI component library
- **React Router DOM** - Client-side routing

### Backend
- **AWS Amplify Gen 2** - Backend-as-a-Service
- **AWS Lambda** - Serverless functions
- **AWS DynamoDB** - NoSQL database
- **AWS S3** - File storage
- **AWS Textract** - Document text extraction
- **AWS Comprehend** - Natural language processing

### AI/ML Features
- **BERT embeddings** - Content-based recommendation system
- **Resume parsing** - Automated skill extraction
- **Matching algorithm** - Student-position alignment

---

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port (e.g., 5174). Check the terminal output for the actual port number.

### Blank Page or Animation Not Showing

1. **Hard refresh the browser:**
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Check the correct port:**
   - Make sure you're accessing the port shown in the terminal output

3. **Check browser console for errors:**
   - Press `F12` to open Developer Tools
   - Check the Console tab for any error messages

### Installation Issues

If you encounter issues during `npm install`:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### AWS Amplify Connection Issues

Ensure you have the correct AWS credentials configured:

```bash
# Configure AWS CLI (if not already done)
aws configure
```

---

## Features

### For Students
- Browse research opportunities
- Upload and manage resumes
- Receive personalized job recommendations
- Track application status
- View faculty profiles and research labs

### For Faculty/Professors
- Post research positions
- Review student applications
- Access enhanced applicant profiles with AI-extracted resume data
- Manage lab information
- Track position statistics

### For Administrators
- Manage user accounts and roles
- Monitor system activity
- Oversee job postings and applications
- Configure system settings

---

## Available Pages

- **Home** (`/`) - Landing page with particle animation background
- **About** (`/about`) - Information about MaSCle
- **Faculty** (`/faculty`) - Faculty profiles and research interests
- **Labs** (`/labs`) - Research lab information
- **Events** (`/events`) - Upcoming events and workshops
- **Find Your Match** (`/find-your-match`) - Job matching platform
- **Dashboard** - User-specific dashboards (role-based)

---

## Contact Information

For any questions, technical support, or inquiries, please contact:

### Development Team
- **Emily Nguyen** - [emilyn98@usc.edu](mailto:emilyn98@usc.edu)
- **Alaba A** - [alabaweh@usc.edu](mailto:alabaweh@usc.edu)
- **Joyce Zhou** - [jezhou@usc.edu](mailto:jezhou@usc.edu)

### USC Machine Learning Center
- Website: [https://ml.usc.edu](https://ml.usc.edu)
- Location: University of Southern California, Los Angeles, CA

---

## License

This project is maintained by the USC Machine Learning Center.

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)

---

**Last Modified:** October 15, 2025  
**Version:** 1.0.0
