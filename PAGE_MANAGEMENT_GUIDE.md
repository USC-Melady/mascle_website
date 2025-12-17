# MaSCle Website - Adding and Removing Pages

This guide explains how to add new pages to the website or remove existing ones.

## Table of Contents
- [Adding a New Page](#adding-a-new-page)
- [Removing a Page](#removing-a-page)
- [Page Structure](#page-structure)
- [Navigation Updates](#navigation-updates)

---

## Adding a New Page

### Step 1: Create the Page Component

1. **Navigate to the pages directory:**
   ```
   d:\mascle_website\src\pages\
   ```

2. **Create a new TypeScript React file** (e.g., `NewPage.tsx`):

```tsx
import React from 'react';
import styled from '@emotion/styled';
import { Container } from 'react-bootstrap';

const USC_RED = '#990000';

const PageContainer = styled.div`
  padding: 0;
  background: #ffffff;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #990000 0%, #cc0000 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const ContentSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const NewPage: React.FC = () => {
  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>New Page Title</HeroTitle>
        <p>Brief description of what this page is about</p>
      </HeroSection>

      <ContentSection>
        <h2>Section Title</h2>
        <p>Your content here...</p>
      </ContentSection>
    </PageContainer>
  );
};

export default NewPage;
```

### Step 2: Add Route to App.tsx

1. **Open** `d:\mascle_website\src\App.tsx`

2. **Import your new page** at the top with other imports:
```tsx
import NewPage from './pages/NewPage';
```

3. **Add a route** inside the `<Routes>` component:
```tsx
<Route path="/new-page" element={<ContentWrapper><NewPage /></ContentWrapper>} />
```

**Full example:**
```tsx
import NewPage from './pages/NewPage';

function App() {
  return (
    <Router basename="/mascle_website/">
      <Header />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/new-page" element={<ContentWrapper><NewPage /></ContentWrapper>} />
        {/* Other routes... */}
      </Routes>
      <Footer />
    </Router>
  );
}
```

### Step 3: Add Navigation Link to Header

1. **Open** `d:\mascle_website\src\components\Header.tsx`

2. **Find the navigation section** (around line 350-400)

3. **Add a navigation link:**

For a **simple link** (desktop nav):
```tsx
<RedNavLink as={Link} to="/new-page">New Page</RedNavLink>
```

For a **dropdown item**:
```tsx
<StyledNavDropdown title="Menu Name" id="menu-dropdown">
  <NavDropdown.Item as={Link} to="/new-page">New Page</NavDropdown.Item>
  <NavDropdown.Item as={Link} to="/other-page">Other Page</NavDropdown.Item>
</StyledNavDropdown>
```

4. **Add the same link to mobile navigation** (find the `<MobileNav>` section):
```tsx
<RedNavLink as={Link} to="/new-page" onClick={handleClose}>
  New Page
</RedNavLink>
```

### Step 4: Test Your New Page

1. **Run the development server:**
   ```powershell
   npm run dev
   ```

2. **Navigate to your page:**
   - Click the navigation link
   - Or go directly: `http://localhost:5173/mascle_website/new-page`

3. **Test responsive design** by resizing the browser window

---

## Removing a Page

### Step 1: Remove the Route from App.tsx

1. **Open** `d:\mascle_website\src\App.tsx`

2. **Find and delete the route:**
```tsx
// Delete this line:
<Route path="/page-to-remove" element={<ContentWrapper><PageToRemove /></ContentWrapper>} />
```

3. **Remove the import statement:**
```tsx
// Delete this line:
import PageToRemove from './pages/PageToRemove';
```

### Step 2: Remove Navigation Links from Header

1. **Open** `d:\mascle_website\src\components\Header.tsx`

2. **Find and delete the navigation link** in desktop nav:
```tsx
// Delete this:
<RedNavLink as={Link} to="/page-to-remove">Page Name</RedNavLink>
```

3. **Also remove from mobile nav** (in the `<MobileNav>` section)

4. **If it's a dropdown item**, remove just that item:
```tsx
// Delete this:
<NavDropdown.Item as={Link} to="/page-to-remove">Page Name</NavDropdown.Item>
```

### Step 3: Remove Footer Link (If Applicable)

1. **Open** `d:\mascle_website\src\components\Footer.tsx`

2. **Search for links** to the removed page and delete them

### Step 4: Delete the Page File (Optional)

1. **Navigate to** `d:\mascle_website\src\pages\`

2. **Delete the page file** (e.g., `PageToRemove.tsx`)

> **Note:** You can keep the file if you might need it later, but removing it keeps the codebase clean.

### Step 5: Test After Removal

1. **Run the development server:**
   ```powershell
   npm run dev
   ```

2. **Verify:**
   - Navigation link is gone
   - Attempting to access the old URL shows 404 or redirects
   - No console errors
   - All other pages still work

---

## Page Structure

### Standard Page Template

Most pages follow this structure:

```tsx
import React from 'react';
import styled from '@emotion/styled';

const USC_RED = '#990000';

// Styled components
const PageContainer = styled.div`
  /* Page wrapper */
`;

const HeroSection = styled.div`
  /* Top banner with title */
`;

const ContentSection = styled.div`
  /* Main content area */
`;

// Component
const PageName: React.FC = () => {
  return (
    <PageContainer>
      <HeroSection>
        {/* Hero content */}
      </HeroSection>
      
      <ContentSection>
        {/* Main content */}
      </ContentSection>
    </PageContainer>
  );
};

export default PageName;
```

### Protected Pages (Authentication Required)

For pages requiring authentication, wrap the route with `ProtectedRoute`:

```tsx
<Route
  path="/protected-page"
  element={
    <ProtectedRoute>
      <ContentWrapper>
        <ProtectedPage />
      </ContentWrapper>
    </ProtectedRoute>
  }
/>
```

### Dashboard Pages

Dashboard pages typically don't need `ContentWrapper`:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

---

## Navigation Updates

### Current Navigation Structure

**Desktop Navigation:**
- Home
- People (dropdown)
  - Faculty
  - Students
- Research (dropdown)
  - Labs
  - Application Overview
  - How to Apply (when not authenticated)
- Education
- Honors
- Sponsors
- About (dropdown)
  - About MaSCle
  - Dev Team & Acknowledgements
- User Menu (when authenticated)
- Login (when not authenticated)

**Mobile Navigation:**
- Same structure, but in a slide-out menu
- Opens via hamburger icon
- Each link closes the menu on click

### Adding to Existing Dropdowns

To add a new page to an existing dropdown (e.g., "Research"):

1. **Find the dropdown** in `Header.tsx`:
```tsx
<StyledNavDropdown title="Research" id="research-dropdown">
  <NavDropdown.Item as={Link} to="/labs">Labs</NavDropdown.Item>
  <NavDropdown.Item as={Link} to="/research-overview">Application Overview</NavDropdown.Item>
  {/* Add your new item here */}
  <NavDropdown.Item as={Link} to="/new-research-page">New Research Page</NavDropdown.Item>
</StyledNavDropdown>
```

2. **Do the same for mobile navigation**

### Creating a New Dropdown

```tsx
<StyledNavDropdown title="New Menu" id="new-menu-dropdown">
  <NavDropdown.Item as={Link} to="/page-one">Page One</NavDropdown.Item>
  <NavDropdown.Item as={Link} to="/page-two">Page Two</NavDropdown.Item>
</StyledNavDropdown>
```

---

## Image Management for New Pages

If your new page needs images:

1. **Place images in** `d:\mascle_website\public\images\`
   - Create a subfolder if needed (e.g., `images/new-page/`)

2. **Use the image helper** in your component:
```tsx
import { getImagePath } from '../utils/imageHelper';

// In your component:
<img src={getImagePath('/images/new-page/photo.jpg')} alt="Description" />
```

3. **For background images:**
```tsx
const HeroSection = styled.div`
  background-image: url(${getImagePath('/images/new-page/bg.jpg')});
  background-size: cover;
`;
```

---

## Checklist for Adding a Page

- [ ] Create page component in `src/pages/`
- [ ] Import page in `App.tsx`
- [ ] Add route in `App.tsx`
- [ ] Add navigation link in `Header.tsx` (desktop)
- [ ] Add navigation link in `Header.tsx` (mobile)
- [ ] Add footer link if applicable
- [ ] Add any required images to `public/images/`
- [ ] Test page locally
- [ ] Test navigation from other pages
- [ ] Test mobile responsiveness
- [ ] Deploy and verify on production

## Checklist for Removing a Page

- [ ] Remove route from `App.tsx`
- [ ] Remove import from `App.tsx`
- [ ] Remove navigation link from `Header.tsx` (desktop)
- [ ] Remove navigation link from `Header.tsx` (mobile)
- [ ] Remove footer link if applicable
- [ ] Delete page component file (optional)
- [ ] Test that old URL redirects properly
- [ ] Test that navigation works correctly
- [ ] Deploy and verify on production

---

**Last Updated:** December 2025
