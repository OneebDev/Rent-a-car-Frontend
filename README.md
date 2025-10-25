# Rent-a-Car Frontend

A modern React-based car rental frontend application built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX** with responsive design
- **Car browsing and filtering** with detailed specifications
- **Booking system** with form validation
- **Contact and corporate enquiry forms**
- **Email notifications** integration
- **Mobile-first design**

## 🛠 Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hook Form** with Zod validation

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.vercel.app
```

## 🚀 Deployment on Vercel

### 1. Connect to GitHub
- Push this repository to GitHub
- Connect your GitHub repository to Vercel

### 2. Configure Environment Variables
In Vercel dashboard, add:
```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app
```

### 3. Deploy
- Vercel will automatically deploy on every push to main branch
- Your frontend will be available at `https://your-frontend-domain.vercel.app`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── BookingModal.tsx
│   ├── CarCard.tsx
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Cars.tsx
│   ├── CarDetails.tsx
│   └── ...
├── data/              # Static data
│   └── carsData.ts
├── config/            # Configuration files
│   └── api.ts
└── assets/            # Images and static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Pages

- **Home** (`/`) - Hero section and featured cars
- **Cars** (`/cars`) - Vehicle listing with filters
- **Car Details** (`/cars/:slug`) - Individual vehicle pages
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form
- **Corporate Enquiries** (`/corporate-enquiries`) - Business rentals

## 🎨 Design Features

- **Responsive design** for all devices
- **Modern animations** with Framer Motion
- **Professional styling** with Tailwind CSS
- **Accessible components** with Radix UI
- **Smooth user experience** with optimized performance

## 🔗 Backend Integration

This frontend connects to the backend API for:
- Email notifications (booking, contact, corporate)
- Form submissions
- Data validation

Make sure your backend is deployed and the `VITE_API_BASE_URL` is correctly configured.