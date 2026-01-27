# Frontend Application

React frontend application for the SaaS platform.

## 📁 Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   ├── assets/         # Images, fonts, etc.
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── Dockerfile
├── vite.config.js
└── package.json
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm run preview
```

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:coverage # Coverage report
```

## 🎨 Styling

This project uses:
- **Material-UI (MUI)** - Component library
- **Emotion** - CSS-in-JS
- **Responsive design** - Mobile-first approach

## 📦 Key Libraries

### Core
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing

### State Management
- **Redux Toolkit** - Global state
- **React Query** - Server state

### UI Components
- **Material-UI** - Component library
- **MUI Icons** - Icon library

### Forms
- **Formik** - Form handling
- **Yup** - Validation schema

### HTTP Client
- **Axios** - API requests

### Notifications
- **React Toastify** - Toast notifications

## 🏗️ Architecture

### Component Structure

```
components/
├── common/          # Shared components
│   ├── Button/
│   ├── Input/
│   └── Modal/
├── layout/          # Layout components
│   ├── Header/
│   ├── Sidebar/
│   └── Footer/
└── features/        # Feature-specific components
    ├── auth/
    ├── dashboard/
    └── profile/
```

### Pages

```
pages/
├── Home/
├── Login/
├── Register/
├── Dashboard/
├── Profile/
└── NotFound/
```

## 🔐 Authentication

Authentication is handled via JWT tokens:
- Access token stored in memory
- Refresh token in httpOnly cookie
- Automatic token refresh
- Protected routes

## 🌐 API Integration

API service layer in `src/services/`:
- Centralized API configuration
- Request/response interceptors
- Error handling
- Type definitions

Example:
```javascript
import api from './services/api';

const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

## 📱 Responsive Design

Breakpoints:
- **xs**: 0px
- **sm**: 600px
- **md**: 960px
- **lg**: 1280px
- **xl**: 1920px

## 🎨 Theming

Customize theme in `src/theme.js`:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});
```

## 🧪 Testing

Test files located next to components:
```
Button/
├── Button.jsx
├── Button.test.jsx
└── Button.module.css
```

## 🐳 Docker

### Build

```bash
docker build -t saas-frontend .
```

### Run

```bash
docker run -p 3000:80 saas-frontend
```

## 🔧 Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SaaS Platform
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📚 Best Practices

1. **Component Organization**: One component per file
2. **Naming Conventions**: PascalCase for components
3. **Props Validation**: Use PropTypes or TypeScript
4. **Code Splitting**: Use React.lazy() for routes
5. **Performance**: Memoize expensive computations
6. **Accessibility**: Use semantic HTML and ARIA labels

## 🤝 Contributing

1. Follow ESLint configuration
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## 📄 License

MIT
