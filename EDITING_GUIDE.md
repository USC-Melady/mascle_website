# MaSCle Website - Editing Existing Pages

This guide explains how to edit existing pages on the MaSCle website, including text, images, styling, and layout changes.

## Table of Contents
- [Before You Start](#before-you-start)
- [Editing Text Content](#editing-text-content)
- [Editing Images](#editing-images)
- [Editing Styles](#editing-styles)
- [Editing Layout](#editing-layout)
- [Common Page Types](#common-page-types)
- [Testing Changes](#testing-changes)

---

## Before You Start

### Development Environment Setup

1. **Install dependencies:**
   ```powershell
   cd d:\mascle_website
   npm install
   ```

2. **Start development server:**
   ```powershell
   npm run dev
   ```
   The site will be available at `http://localhost:5173`

3. **Open in your code editor** (VS Code recommended)

### Understanding the File Structure

```
d:\mascle_website\
├── src/
│   ├── pages/           # Page components (edit these for content)
│   ├── components/      # Reusable components (Header, Footer, etc.)
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── public/
│   └── images/          # All images and icons
└── index.html           # Main HTML (favicon, title, etc.)
```

---

## Editing Text Content

### Step 1: Find the Page File

All pages are located in `d:\mascle_website\src\pages\`

Common pages:
- **Home page:** `src/components/MainContent.tsx`
- **About page:** `src/pages/AboutPage.tsx`
- **Faculty page:** `src/pages/FacultyPage.tsx`
- **Labs page:** `src/pages/LabsPage.tsx`
- **Sponsors page:** `src/components/SponsorsPage.tsx`
- **Acknowledgements:** `src/pages/AcknowledgementsPage.tsx`

### Step 2: Edit the Text

1. **Open the page file** in your code editor

2. **Find the text** you want to change (use Ctrl+F to search)

3. **Edit the text** directly in the JSX:

**Example - Changing a title:**
```tsx
// Before:
<HeroTitle>Welcome to MaSCle</HeroTitle>

// After:
<HeroTitle>Welcome to USC Machine Learning Center</HeroTitle>
```

**Example - Changing a paragraph:**
```tsx
// Before:
<p>Old description text here</p>

// After:
<p>New updated description text here</p>
```

### Step 3: Save and Preview

1. **Save the file** (Ctrl+S)
2. **Check your browser** - changes should appear automatically (hot reload)
3. **If changes don't appear**, refresh the page (F5)

### Common Text Elements

**Titles:**
```tsx
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
```

**Paragraphs:**
```tsx
<p>Regular paragraph text goes here.</p>
```

**Lists:**
```tsx
<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>
```

**Links:**
```tsx
<a href="https://example.com">Link text</a>

// Internal links (to other pages):
<Link to="/about">About Us</Link>
```

---

## Editing Images

### Changing an Image

1. **Add your new image** to `d:\mascle_website\public\images\`
   - Use appropriate subfolder (e.g., `images/faculty/`, `images/labs/`)
   - Recommended formats: JPG, PNG
   - Recommended naming: lowercase, no spaces (use hyphens or underscores)

2. **Find the image reference** in the page file:
```tsx
// Old:
<img src={getImagePath('/images/faculty/old-photo.jpg')} alt="Professor Name" />

// New:
<img src={getImagePath('/images/faculty/new-photo.jpg')} alt="Professor Name" />
```

3. **Save and check** the result

### Image Best Practices

- **Alt text:** Always include descriptive alt text for accessibility
- **Size:** Optimize images before uploading (recommended max: 1920px width)
- **Format:** 
  - Photos: JPG (smaller file size)
  - Graphics/logos: PNG (transparency support)
- **Naming:** Use descriptive names (e.g., `john-doe.jpg` not `IMG_1234.jpg`)

### Background Images

To change a background image:

```tsx
const HeroSection = styled.div`
  background-image: url(${getImagePath('/images/new-background.jpg')});
  background-size: cover;
  background-position: center;
`;
```

### Logos in Header/Footer

**Header logo:**
- File: `src/components/Header.tsx`
- Look for: `<MascleLogo src={getImagePath('/images/mascle_logo2.png')} ... />`

**Footer logos:**
- File: `src/components/Footer.tsx`
- Look for image references in the footer section

---

## Editing Styles

The website uses **Emotion** (CSS-in-JS) for styling. Styles are defined directly in the component files.

### Understanding Styled Components

Styled components look like this:

```tsx
const StyledElement = styled.div`
  background-color: #990000;
  padding: 2rem;
  font-size: 1.2rem;
`;
```

### Common Style Changes

#### Changing Colors

Find the USC_RED constant or color values:

```tsx
// USC Red is defined at the top of most files:
const USC_RED = '#990000';

// To change a color:
const Element = styled.div`
  background-color: #990000;  // Change this hex code
  color: #ffffff;              // Text color
`;
```

#### Changing Spacing

```tsx
const Section = styled.div`
  padding: 2rem;           // Space inside element
  margin: 1rem;            // Space outside element
  gap: 1.5rem;             // Space between child elements
`;
```

Common spacing units:
- `rem` - Relative to root font size (recommended)
- `px` - Fixed pixels
- `%` - Percentage of parent

#### Changing Font Sizes

```tsx
const Title = styled.h1`
  font-size: 3rem;         // Large title
  font-weight: 700;        // Bold
  line-height: 1.2;        // Space between lines
`;

const Text = styled.p`
  font-size: 1rem;         // Body text
  font-weight: 400;        // Regular
  line-height: 1.6;        // Comfortable reading
`;
```

#### Changing Layout

**Flexbox (for horizontal/vertical alignment):**
```tsx
const Container = styled.div`
  display: flex;
  flex-direction: row;          // or 'column'
  justify-content: center;      // horizontal alignment
  align-items: center;          // vertical alignment
  gap: 1rem;                    // space between items
`;
```

**Grid (for multi-column layouts):**
```tsx
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);  // 3 equal columns
  gap: 2rem;                              // space between items
`;
```

### Responsive Design

Most pages have mobile-friendly styles using media queries:

```tsx
const Element = styled.div`
  padding: 4rem;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem;      // Smaller padding on mobile
    font-size: 1.5rem;  // Smaller text on mobile
  }
`;
```

Common breakpoints:
- `768px` - Mobile/tablet boundary
- `992px` - Tablet/desktop boundary
- `1200px` - Desktop/large desktop

---

## Editing Layout

### Changing Section Order

To reorder sections on a page, move the JSX blocks:

```tsx
// Before:
<PageContainer>
  <Section1 />
  <Section2 />
  <Section3 />
</PageContainer>

// After (reordered):
<PageContainer>
  <Section3 />
  <Section1 />
  <Section2 />
</PageContainer>
```

### Adding/Removing Sections

**To remove a section:**
1. Find the section in the JSX
2. Delete or comment out the entire section:

```tsx
{/* 
<ContentSection>
  <h2>Removed Section</h2>
  <p>This section is hidden</p>
</ContentSection>
*/}
```

**To add a section:**
1. Copy an existing section structure
2. Modify the content
3. Place it where you want it in the JSX

### Changing Grid Layouts

To change how many items appear in a row:

```tsx
// Before (3 columns):
const Grid = styled.div`
  grid-template-columns: repeat(3, 1fr);
`;

// After (4 columns):
const Grid = styled.div`
  grid-template-columns: repeat(4, 1fr);
`;

// Or responsive (2 on mobile, 4 on desktop):
const Grid = styled.div`
  grid-template-columns: repeat(2, 1fr);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;
```

---

## Common Page Types

### Home Page (`src/components/MainContent.tsx`)

**Key sections:**
- Hero section with particle animation
- Welcome text
- Featured content

**Common edits:**
- Change hero title and subtitle
- Adjust animation speed
- Update welcome message

### Content Pages (About, Education, etc.)

**Standard structure:**
```tsx
<PageContainer>
  <HeroSection>
    <HeroTitle>Page Title</HeroTitle>
    <HeroSubtitle>Subtitle</HeroSubtitle>
  </HeroSection>
  
  <ContentSection>
    {/* Main content */}
  </ContentSection>
</PageContainer>
```

**Common edits:**
- Update hero title/subtitle
- Edit content sections
- Add/remove paragraphs
- Update images

### List Pages (Faculty, Labs, Students)

**Data-driven pages** that map over arrays:

```tsx
const facultyData = [
  { name: 'Prof. Smith', title: 'Associate Professor', image: '/images/smith.jpg' },
  { name: 'Prof. Jones', title: 'Professor', image: '/images/jones.jpg' },
];

// Render:
{facultyData.map((person, index) => (
  <FacultyCard key={index}>
    <img src={getImagePath(person.image)} alt={person.name} />
    <h3>{person.name}</h3>
    <p>{person.title}</p>
  </FacultyCard>
))}
```

**To add a person:**
1. Add image to `public/images/faculty/`
2. Add entry to the data array
3. Save and check

### Sponsors Page (`src/components/SponsorsPage.tsx`)

**Sponsor grid structure:**
```tsx
const sponsors = [
  { name: 'Company Name', logo: '/images/sponsors/logo.png' },
  // ...
];
```

**To update:**
1. Add logo to `public/images/sponsors/`
2. Add/edit entry in sponsors array
3. Adjust grid layout if needed

---

## Testing Changes

### Local Testing Checklist

After making changes:

- [ ] **Visual check** - Does it look correct?
- [ ] **Text check** - No typos or grammar errors?
- [ ] **Links** - Do all links work?
- [ ] **Images** - Do all images load?
- [ ] **Responsive** - Resize browser to check mobile view
- [ ] **Console** - Open browser DevTools (F12), check for errors
- [ ] **Navigation** - Can you navigate between pages?

### Mobile Testing

1. **Browser responsive mode:**
   - Press F12 to open DevTools
   - Click device icon or press Ctrl+Shift+M
   - Select different device sizes

2. **Test different sizes:**
   - Mobile: 375px, 414px
   - Tablet: 768px, 834px
   - Desktop: 1024px, 1440px, 1920px

### Building for Production

Before deploying, test the production build:

```powershell
npm run build
npm run preview
```

This builds the optimized version and serves it locally.

---

## Common Editing Tasks

### Updating Navigation Menu

**File:** `src/components/Header.tsx`

**Change menu item text:**
```tsx
// Before:
<RedNavLink as={Link} to="/education">Education</RedNavLink>

// After:
<RedNavLink as={Link} to="/education">Learning Programs</RedNavLink>
```

**Add dropdown item:**
```tsx
<StyledNavDropdown title="Research" id="research-dropdown">
  <NavDropdown.Item as={Link} to="/labs">Labs</NavDropdown.Item>
  {/* Add new item: */}
  <NavDropdown.Item as={Link} to="/publications">Publications</NavDropdown.Item>
</StyledNavDropdown>
```

### Updating Footer

**File:** `src/components/Footer.tsx`

**Change footer text:**
```tsx
<FooterText>
  © 2025 USC Machine Learning Center. All rights reserved.
</FooterText>
```

**Update contact info:**
```tsx
<ContactItem>
  <i className="bi bi-envelope"></i>
  <span>newemail@mascle.usc.edu</span>
</ContactItem>
```

### Changing Page Title

**File:** `index.html` (root directory)

```html
<title>MASCLE - New Title</title>
```

### Updating Favicon

**File:** `index.html` (root directory)

Replace the icon link tags with your new favicon path:
```html
<link rel="icon" type="image/png" sizes="32x32" href="./images/new-favicon.png" />
```

---

## Style Guide

### Colors

- **Primary Red:** `#990000` (USC Red)
- **White:** `#ffffff`
- **Light Gray:** `#f8f9fa`
- **Dark Gray:** `#333333`
- **Medium Gray:** `#666666`

### Typography

- **Hero Titles:** 3-3.5rem, weight 700
- **Section Titles:** 2-2.5rem, weight 700
- **Subsection Titles:** 1.3-1.5rem, weight 700
- **Body Text:** 1rem, weight 400
- **Small Text:** 0.9rem

### Spacing

- **Section Padding:** 5rem (desktop), 3rem (mobile)
- **Card Padding:** 2rem
- **Element Gaps:** 1-2rem
- **Border Radius:** 8-12px

---

## Tips and Best Practices

1. **Always save after editing** (Ctrl+S)
2. **Test changes immediately** in your browser
3. **Keep backups** before major changes (`git commit`)
4. **Use consistent spacing** - follow existing patterns
5. **Maintain responsive design** - test mobile view
6. **Check for console errors** (F12 → Console tab)
7. **Use descriptive commit messages** when pushing changes
8. **Test all links** after making navigation changes
9. **Optimize images** before uploading (compress large files)
10. **Keep accessibility in mind** (alt text, semantic HTML)

---

## Troubleshooting

### Changes Not Appearing

1. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Restart dev server:** Stop (Ctrl+C) and run `npm run dev` again
3. **Clear browser cache**
4. **Check for syntax errors** in the console

### Broken Layout

1. **Check for missing closing tags** (`</div>`, `</styled>`)
2. **Verify all styled components** have matching backticks
3. **Check CSS syntax** in styled components
4. **Look for typos** in property names

### Images Not Loading

1. **Verify file exists** in `public/images/`
2. **Check file name** matches exactly (case-sensitive)
3. **Use `getImagePath()` helper** for all image paths
4. **Check for URL encoding** (spaces should be `%20`)

### TypeScript Errors

1. **Check imports** are correct
2. **Verify prop types** match
3. **Run `npm install`** if packages are missing
4. **Restart TypeScript server** in VS Code

---

## Getting Help

If you encounter issues:

1. **Check browser console** (F12) for error messages
2. **Review Git history** to see what changed: `git log`
3. **Revert changes** if needed: `git checkout -- filename`
4. **Contact development team** with:
   - What you were trying to do
   - What happened instead
   - Error messages (screenshots help)
   - Which file(s) you edited

---

**Last Updated:** December 2025
