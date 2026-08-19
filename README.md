# 🏠 NextKinLife — Frontend

> **Accommodation & Community Platform**
> A modern React-based frontend for discovering accommodations, connecting with communities, attending events, and accessing resources — built with Vite, Redux Toolkit, and Tailwind CSS.

---

## 📋 Table of Contents

- [Tools & Technologies Used](#-tools--technologies-used)
- [Skills Demonstrated](#-skills-demonstrated)
- [SEO Features & Architecture](#-seo-features--architecture)
- [Resume Skills Section (ATS-Friendly)](#-resume-skills-section-ats-friendly)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Application Routes](#-application-routes)
- [State Management](#-state-management)
- [Key Features](#-key-features)
- [Deployment](#-deployment)
- [Docker](#-docker)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Development Notes](#-development-notes)
- [Contributing](#-contributing)

---

## 🛠 Tools & Technologies Used

### Frontend
- **React 19**
- **React DOM**
- **Vite**
- **JavaScript (ES Modules / ES6+)**
- **React Router DOM v7** (with Lazy Loading & Suspense)

### State Management
- **Redux Toolkit (RTK)**
- **React Redux**
- **RTK Query** (for API polling, caching, and state management)

### Styling & UI
- **Tailwind CSS v4**
- **PostCSS** & **Autoprefixer**
- **Tailwind Merge** & **Class Variance Authority (CVA)**
- **clsx**
- **Radix UI** (Checkbox, Label, Slider, Slot primitives)
- **Lucide React** & **React Icons**
- **Sonner** (for toast notifications)

### Animations
- **Framer Motion**

### Forms
- **React Hook Form**
- **React Day Picker** (calendar inputs)

### API & Communication
- **Axios** (configured HTTP client)
- **Socket.IO Client** (WebSocket real-time communication)

### Utilities
- **date-fns**
- **country-state-city** (geographic selectors)
- **AWS SDK**
- **Dynamoose**

### Development Tools
- **ESLint**
- **Vite Plugin React**
- **Git** & **GitHub**
- **npm**

### Cloud & Deployment Tools
- **AWS S3**
- **AWS CloudFront**
- **AWS SDK**
- **Docker**
- **Nginx**
- **Jenkins**
- **Vercel**
- **Netlify**
- **Apache**

---

## 🚀 Skills Demonstrated

### Frontend Architecture
- **Component-Based Architecture**: Designing highly reusable UI primitives (buttons, cards, inputs) and compound components.
- **Modular Architecture**: Separating route pages, UI components, custom hooks, services, and utility helpers.
- **Single Page Application (SPA) Development**: Optimizing route transitions, dynamic layouts, and client-side history navigation.
- **Responsive Web Design**: Implementing a fluid, mobile-first design system utilizing Tailwind CSS breakpoints.

### State Management
- **Global State Management**: Redux Toolkit for UI slices (auth, notifications).
- **API Caching & Query Management**: Caching backend responses via RTK Query to reduce redundant network overhead.
- **Session Management**: Preserving and checking authentication states across page reloads.

### API Integration
- **REST API Integration**: Standardizing API calls via automated Axios clients and query hooks.
- **Authentication Flows**: Secure registration, login, and authorization guards (`HostGuard`).
- **Real-Time Communication**: Multi-channel WebSocket connections for messaging and live updates.

### Performance Optimization
- **Code Splitting**: Splitting the production bundle by routes using dynamic imports (`lazy`).
- **Lazy Loading**: Delaying component loading until they are required, using `Suspense` for loading states.
- **Tree Shaking**: Removing unused module exports via Vite/Rollup production compilation.
- **Asset Optimization**: Optimizing image loading and asset paths in the build pipeline.

### Feature Development Skills
- **Accommodation Booking Platform**: Structuring listing systems, search filters, and multi-step onboarding forms (with KYC validations).
- **Community & Events Platform**: Event creation, registration/RSVPs, and community groups.
- **Marketplace Module**: E-commerce pages for viewing services/products and details.
- **Real-Time Features**: Private instant messaging, typing indicators, and live notifications.
- **Multi-Country Support**: Utilizing country-state-city data to implement localized geo-filtering.

---

## 🔍 SEO Features & Architecture

This project is built as a highly performant Single Page Application (SPA). The following SEO-related features and optimizations are active or supported:

- **Single Page Application (SPA) Optimization**: Configured to serve fast initial responses.
- **Route-based Lazy Loading & Code Splitting**: Minimizes critical render-blocking bundles, improving page load speed (a key factor in Core Web Vitals and search rankings).
- **Web Performance & Load Time Optimization**: Assets are compiled, compressed, and hashed by Vite to ensure lightning-fast client loading.
- **Responsive & Mobile-First Design**: Enhanced search engine indexing through standard mobile viewport configurations and fully responsive layouts.
- **Google Fonts Preconnecting**: `<link rel="preconnect">` tags for font domains are placed in the `<head>` tag of `index.html` to reduce latency.
- **Clean URL Structure**: Search-engine-friendly URLs configured via React Router DOM v7 (no hash symbols in routes).
- **SPA Rewrite Configurations**: 
  - **Vercel** (`vercel.json` rewrite routing rules to prevent 404s on deep links)
  - **Nginx** (`nginx.conf` fallback directive: `try_files $uri $uri/ /index.html`)
- **CloudFront CDN Distribution**: Serves static pages and assets from edge nodes near the user, drastically lowering Time to First Byte (TTFB).
- **AWS S3 Static Hosting**: Reliably hosts the production-ready build output.
- **Browser Caching via CDN**: Long-term caching of immutable assets (JS, CSS, images) configured at the network distribution level.

---

## 💼 Resume Skills Section (ATS-Friendly)

- **Frontend**: React.js, JavaScript (ES6+), Vite, Redux Toolkit, RTK Query, React Router DOM, Tailwind CSS, Framer Motion, React Hook Form, Axios, Socket.IO
- **State Management**: Redux Toolkit, React Redux, RTK Query
- **UI/UX**: Tailwind CSS, Radix UI, Responsive Design, Component Libraries, Mobile-First Design
- **API Integration**: REST APIs, Axios Client, Authentication, JWT/Cookie-Based Authorization, WebSocket Communication
- **Cloud & DevOps**: AWS S3, CloudFront, Docker, Nginx, Jenkins CI/CD, Vercel, Netlify
- **SEO & Performance**: Technical SEO, React SEO, Core Web Vitals Optimization, Site Speed Optimization, Mobile-Friendly Development, CDN Optimization (CloudFront), Lazy Loading, Code Splitting, Performance Tuning, Search-Friendly Routing, Static Asset Optimization
- **Tools**: Git, GitHub, ESLint, PostCSS, AWS SDK, npm

---

## 📁 Project Structure

```
frontend-accommodations/
├── public/                     # Static assets (logos, images, flags)
├── src/
│   ├── app/                    # Page-level components (route pages)
│   │   ├── page.jsx            # Home page
│   │   ├── layout.jsx          # Root layout wrapper
│   │   ├── globals.css         # Global styles
│   │   ├── about/              # About page
│   │   ├── career/             # Career listings page
│   │   ├── contact/            # Contact page
│   │   ├── dashboard/          # User dashboard
│   │   ├── events/             # Events listing & details (/events, /events/:id, /events/host)
│   │   ├── groups/             # Groups CRUD (/groups, /groups/create, /groups/:id)
│   │   ├── help/               # Help center
│   │   ├── host/               # Host creation flow
│   │   ├── marketplace/        # Marketplace listing & product details
│   │   ├── privacy/            # Privacy policy
│   │   ├── resources/          # Travel, community, and legal resources
│   │   ├── rooms/              # Room details page
│   │   ├── signin/             # Sign-in page
│   │   ├── signup/             # Sign-up page
│   │   ├── terms/              # Terms of service
│   │   ├── trust/              # Trust & safety
│   │   ├── wishlist/           # User wishlist
│   │   ├── ChatPage.jsx        # Real-time chat
│   │   └── SearchPage.jsx      # Search with filters
│   │
│   ├── components/             # Reusable UI components
│   │   ├── account/            # Account settings components
│   │   ├── account-v2/         # Redesigned account components
│   │   ├── auth/               # Auth guards, form inputs (HostGuard, TextInput)
│   │   ├── career/             # Career page components
│   │   ├── chat/               # Chat UI components
│   │   ├── common/             # Shared components
│   │   ├── contact/            # Contact form components
│   │   ├── dashboard/          # Dashboard widgets (TravelCommunity)
│   │   ├── events/             # Event card, event details components
│   │   ├── features/           # Feature showcase components
│   │   ├── groups/             # Group card, group form components
│   │   ├── home/               # Home page sections (HomeFeatured, MobileHomeHeader)
│   │   ├── host/               # Host onboarding form
│   │   ├── layout/             # Navbar, Footer, Sidebar, MobileFooterNav, ScrollToTop
│   │   ├── marketplace/        # Marketplace components
│   │   ├── mentorship/         # Mentorship / support page
│   │   ├── property/           # Property listing components
│   │   ├── search/             # Search bar, filters, results
│   │   ├── travel/             # Travel resource components
│   │   └── ui/                 # Base UI primitives (Button, Card, Dialog, Input, Skeleton, etc.)
│   │
│   ├── context/                # React Context providers
│   │   └── CountryContext.jsx  # Country/region context for geo-based features
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useClickOutside.js  # Detect clicks outside a ref
│   │   ├── useHostCreation.js  # Multi-step host creation logic
│   │   ├── useHostSubmission.js# Host form submission logic
│   │   ├── usePagination.js    # Pagination logic
│   │   └── useTimeAgo.js       # Relative time formatting
│   │
│   ├── lib/                    # Utilities & data files
│   │   ├── axiosClient.js      # Configured Axios instance
│   │   ├── socket.js           # Socket.IO client setup
│   │   ├── utils.js            # General utility (cn helper)
│   │   ├── imageUtils.js       # Image processing helpers
│   │   ├── eventUtils.js       # Event-related utilities
│   │   ├── navigationUtils.js  # Navigation helpers
│   │   ├── pincodeUtils.js     # Pincode lookup utilities
│   │   ├── mock-data.js        # Mock data for development
│   │   ├── mock-events.js      # Mock event data
│   │   ├── mock-jobs.js        # Mock job listings
│   │   ├── community-data.js   # Community resource data
│   │   ├── travel-data.js      # Travel resource data
│   │   ├── legal-data.js       # Legal resource data
│   │   ├── jobs-data.js        # Jobs data
│   │   ├── host-kyc-data.js    # Host KYC form data
│   │   ├── host-rules-data.js  # Host rules definitions
│   │   ├── host-terms-data.js  # Host terms & conditions
│   │   └── upload-guidelines.js# File upload guidelines
│   │
│   ├── services/               # External service integrations
│   │   └── hostService.js      # Host API service layer
│   │
│   ├── store/                  # Redux store
│   │   ├── store.js            # Store configuration
│   │   ├── api/                # RTK Query API slices
│   │   │   ├── authApi.js      # Authentication endpoints
│   │   │   └── hostApi.js      # Host/accommodation endpoints
│   │   └── slices/             # Redux state slices
│   │       ├── authSlice.js    # Auth state (user, tokens)
│   │       └── notificationSlice.js  # Notification state
│   │
│   ├── App.jsx                 # Root component with route definitions
│   └── main.jsx                # Application entry point (React DOM + Redux Provider)
│
├── .env.example                # Environment variable template
├── Dockerfile                  # Multi-stage Docker build (Node → Nginx)
├── Jenkinsfile                 # CI/CD pipeline (Build → S3 → CloudFront)
├── nginx.conf                  # Nginx config for SPA routing
├── vite.config.js              # Vite configuration (aliases, proxies)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel SPA rewrite rules
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies & scripts
└── index.html                  # HTML entry point
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation
```bash
# 1. Clone the repository
git clone <repository-url>
cd frontend-accommodations

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see below)

# 4. Start development server
npm run dev
```
The app will be available at **http://localhost:5173**.

---

## 🔐 Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=https://localhost:5000

# Socket.IO Configuration
VITE_SOCKET_URL=https://api.nextkinlife.live

# Third-Party Proxies (should point to YOUR backend, not external APIs)
VITE_NOMINATIM_URL=https://api.yourdomain.com/nominatim
```
> **Note:** All environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server with HMR (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🗺 Application Routes

### Public Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | Home | Landing page with featured listings |
| `/about` | About | About NextKinLife |
| `/career` | Career | Job listings & career information |
| `/contact` | Contact | Contact form |
| `/help` | Help | Help center & FAQ |
| `/trust` | Trust & Safety | Trust and safety information |
| `/privacy` | Privacy Policy | Privacy policy page |
| `/terms` | Terms of Service | Terms and conditions |
| `/search` | Search | Accommodation search with filters |
| `/rooms/:id` | Room Details | Individual room/listing detail view |
| `/events` | Events | Browse community events |
| `/events/:id` | Event Details | Individual event detail view |
| `/groups` | Groups | Browse community groups |
| `/groups/:id` | Group Details | Individual group detail view |
| `/marketplace` | Marketplace | Browse products and services |
| `/marketplace/:id` | Product Details | Individual product detail view |
| `/travel` | Travel Resources | Travel information & resources |
| `/resources/community` | Community Resources | Community guides and resources |
| `/resources/legal` | Legal Resources | Legal guides and resources |
| `/resources/travel` | Travel Community | Travel community features |
| `/support` | Support / Mentorship | Mentorship and support page |
| `/signup` | Sign Up | User registration |
| `/signin` | Sign In | User login |

### Protected Routes (requires authentication via `HostGuard`)

| Route | Page | Description |
| :--- | :--- | :--- |
| `/host/create` | Create Listing | Multi-step accommodation creation form |
| `/events/host` | Host Event | Create and manage events |
| `/wishlist` | Wishlist | Saved/favorited listings |

### Other Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/hosts` | Host Onboarding | Host onboarding form |
| `/chat` | Chat | Real-time messaging |
| `/chat/:id` | Chat Thread | Individual chat conversation |
| `/account-v2` | Dashboard | User dashboard (account management) |
| `/groups/create` | Create Group | Create a new group |
| `/groups/add-resource` | Add Resource | Add resource to a group |

---

## 🗃 State Management
The app uses Redux Toolkit with RTK Query for server state management.

### Store Structure
```
store/
├── store.js                  # configureStore with middleware
├── api/
│   ├── authApi.js            # RTK Query — auth endpoints (login, register, session)
│   └── hostApi.js            # RTK Query — host/accommodation CRUD endpoints
└── slices/
    ├── authSlice.js          # Auth state (user profile, tokens, login status)
    └── notificationSlice.js  # In-app notification state
```

### Context Providers
- **`CountryProvider`**: Wraps the entire app to provide country/region data for geo-based features.
- **`Redux Provider`**: Wraps the app at `main.jsx` level for global state access.

---

## ✨ Key Features

### 🏡 Accommodation Management
- Browse and search accommodations with advanced filters.
- Detailed room/listing pages with image galleries.
- Multi-step host creation form with KYC verification.
- Wishlist / save functionality.
- Socket.IO-powered messaging.
- Individual chat threads (`/chat/:id`).

### 📅 Events
- Browse and discover community events.
- Event details with RSVP functionality.
- Host-only event creation (behind auth guard).

### 👥 Groups & Community
- Create and join community groups.
- Add resources to groups.
- Community resource pages.

### 🛒 Marketplace
- Browse products and services.
- Product detail pages.

### 🔐 Authentication
- Sign up / Sign in with form validation.
- Protected routes via `HostGuard` component.
- Session management through RTK Query (`authApi`).

### 🌍 Internationalization-Ready
- Country/state/city selector powered by `country-state-city`.
- Country flag assets in `/public/flags/`.
- `CountryContext` for location-aware features.

### 📚 Resource Center
- Travel guides and resources.
- Community information.
- Legal resources and guides.
- Career listings.

---

## 🚢 Deployment

### Vercel
The project includes a `vercel.json` for single-page app routing:
```json
{
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```
Deploy with:
```bash
npx vercel --prod
```

### AWS S3 + CloudFront
Production deployment is automated via Jenkins:
- **S3 Bucket**: `prod-nextkinlife-frontend`
- **CloudFront Distribution**: `EE19WHFK5I0FA`
- **AWS Region**: `us-east-2`

---

## 🐳 Docker
The project uses a multi-stage Docker build:
1. **Build stage**: `node:20-alpine` installs dependencies and builds the Vite project.
2. **Runtime stage**: `nginx:stable-alpine` serves the static files.

```bash
# Build the image
docker build -t nextkinlife-frontend .

# Run the container
docker run -p 80:80 nextkinlife-frontend
```

### Exposed Ports
- `80` (Nginx HTTP, primary)
- `2245` (Alternative port)
- `8080` (Alternative port)

### Nginx Configuration
The included `nginx.conf` handles SPA routing by redirecting all routes to `index.html`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔄 CI/CD Pipeline
The `Jenkinsfile` defines a 4-stage pipeline:
```
Checkout → Build Frontend → Deploy to S3 → Invalidate CloudFront
```

| Stage | Description |
| :--- | :--- |
| **Checkout** | Pulls the latest code from SCM. |
| **Build Frontend** | Runs `npm install && npm run build` inside `node:18-alpine`. |
| **Deploy to S3** | Syncs `dist/` to the S3 bucket with `--delete` flag. |
| **Invalidate CloudFront** | Creates a CloudFront invalidation for `/*` to bust cache. |

### Required Jenkins Credentials
- `aws-creds`: AWS credentials (via `AmazonWebServicesCredentialsBinding`).

---

## 🔧 Development Notes

### Path Aliases
The project uses the `@` alias pointing to `./src`:
```javascript
import Component from "@/components/ui/Button";
```
Configured in `vite.config.js` via `resolve.alias`.

### Dev Server Proxy
The Vite dev server proxies API requests to avoid CORS issues:

| Proxy Path | Target | Notes |
| :--- | :--- | :--- |
| `/api/host` | `http://localhost:5000` | Host-specific API endpoints |
| `/api` | `http://localhost:5000` | General API endpoints with cookie rewriting |
| `/socket.io` | `http://localhost:5000` | WebSocket connections (ws: true) |

All proxied requests include custom headers for `Host` and `Origin` to match production domains, and `Set-Cookie` headers are rewritten for local development compatibility.

### Lazy Loading
All page-level components are lazy-loaded using `React.lazy()` with a `<Suspense>` fallback (`LoadingSpinner`), ensuring optimal initial bundle size.

---

## 🤝 Contributing
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Follow existing ESLint rules (`npm run lint`).
- Use the `@/` path alias for imports from `src/`.
- Place page components in `src/app/`.
- Place reusable components in `src/components/`.
- Use RTK Query for API calls, Redux slices for client state.

---

## 📄 License
This project is private and proprietary.
