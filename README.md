# Ledger Management App

A modern, feature-rich financial management application built with React, TypeScript, and Supabase. Track your sales, manage expenses, and gain insights with comprehensive reporting—all from a beautiful, intuitive dashboard.

## Features

- **📊 Dashboard**: Real-time overview of your financial metrics and key statistics
- **💰 Sales Tracking**: Record and monitor all your sales transactions with detailed categorization
- **📝 Expense Management**: Track business expenses with easy-to-use forms and organization
- **📈 Reports**: Generate comprehensive financial reports and analytics
- **👤 Business Profiles**: Set up and manage your business information
- **⚙️ Settings**: Customize app preferences and user account settings
- **🔐 Authentication**: Secure user authentication and authorization
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**:
  - [React 18](https://react.dev) - UI library
  - [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
  - [Vite](https://vitejs.dev) - Next-generation build tool
  - [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
  - [shadcn/ui](https://ui.shadcn.com) - High-quality React components

- **State Management & Data**:
  - [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
  - [React Hook Form](https://react-hook-form.com) - Performant form validation
  - [Zod](https://zod.dev) - TypeScript-first schema validation

- **Backend & Database**:
  - [Supabase](https://supabase.com) - Open-source Firebase alternative
  - PostgreSQL - Relational database

- **Additional Tools**:
  - [Sonner](https://sonner.emilkowal.ski) - Toast notifications
  - [date-fns](https://date-fns.org) - Date utility library
  - [ESLint](https://eslint.org) - Code linting
  - [Vitest](https://vitest.dev) - Unit testing framework

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher)
- [Bun](https://bun.sh) (optional, for faster package management)
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ledger-management
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Scripts

- `bun run dev` - Start development server with hot module replacement
- `bun run build` - Build for production
- `bun run build:dev` - Build for development
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint code quality checks
- `bun run test` - Run tests once with Vitest
- `bun run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/           # React components
│   ├── layout/          # Layout components
│   ├── ui/              # shadcn/ui components
│   └── NavLink.tsx      # Navigation link component
├── pages/               # Page components (routes)
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Sales.tsx        # Sales management
│   ├── Expenses.tsx     # Expense management
│   ├── Reports.tsx      # Financial reports
│   ├── Settings.tsx     # App settings
│   ├── Onboarding.tsx   # First-time setup
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication hook
│   ├── useBusiness.tsx  # Business data hook
│   ├── useExpenses.tsx  # Expense management hook
│   ├── useSales.tsx     # Sales management hook
│   └── use-mobile.tsx   # Mobile detection hook
├── integrations/        # Third-party integrations
│   └── supabase/        # Supabase client & types
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
├── test/                # Test files
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Features in Detail

### Sales Management
- Create and track sales transactions
- Categorize sales by type
- View sales history and trends
- Export sales data for analysis

### Expense Tracking
- Record business expenses
- Organize expenses by category
- Track payment methods
- Monitor spending patterns

### Financial Reports
- Generate monthly/quarterly/annual reports
- Visualize financial data with charts
- Export reports in multiple formats
- Analyze income vs. expenses trends

### User Authentication
- Secure login and registration
- Profile management
- Account settings
- Session management

## Development Workflow

### Code Quality
- ESLint is configured to maintain code standards
- Run `npm run lint` before committing code
- TypeScript provides compile-time type checking

### Testing
- Unit tests are located in `src/test/`
- Use Vitest for running tests
- Run tests with `npm run test` or `npm run test:watch`

### Form Handling
- React Hook Form for performant forms
- Zod for schema validation
- Real-time form validation

## Database Schema

The app uses Supabase PostgreSQL with tables for:
- **users** - User accounts and authentication
- **businesses** - Business information and profiles
- **sales** - Sales transaction records
- **expenses** - Expense transaction records
- **categories** - Transaction categories

See `supabase/migrations/` for detailed schema definitions.

## Deployment

### Build for Production
```bash
bun run build
```

The optimized build will be in the `dist/` directory.

### Deploy Options
- [Vercel](https://vercel.com) - Recommended for Vite/React apps
- [Netlify](https://netlify.com) - Alternative deployment platform
- [Any static host](https://vitejs.dev/guide/static-deploy.html) - Traditional hosting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Troubleshooting

### Common Issues

**Supabase Connection Fails**
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Ensure your Supabase project is active

**Hot Module Replacement (HMR) Not Working**
- Clear the browser cache
- Restart the development server

**Build Errors**
- Clear `node_modules` and reinstall: `bun install` or `npm install`
- Delete `.vite` cache directory

## Performance Optimization

- TanStack Query caches API responses and manages server state
- React Hook Form minimizes re-renders
- Vite optimizes build size with code splitting
- Lazy loading for route components

## Security

- Environment variables for sensitive data (never commit `.env.local`)
- Supabase Row Level Security (RLS) for database protection
- Secure authentication via Supabase Auth

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

## Roadmap

- [ ] Multi-currency support
- [ ] Advanced analytics and insights
- [ ] Budget planning tools
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Bulk import/export functionality
- [ ] Team collaboration features

---

Built with ❤️ for financial management enthusiasts.

