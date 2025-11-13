# Day 2 - Project Structure Documentation

## 🏗️ **Monorepo Architecture Overview**

The Viewesta platform has been reorganized into a professional monorepo structure following industry best practices. This structure enables:

- **Clear Separation of Concerns** - Each application has its own space
- **Shared Code Reuse** - Common packages for database, types, and UI
- **Independent Development** - Teams can work on different apps simultaneously
- **Unified Deployment** - Single repository for all platform components
- **Scalable Architecture** - Easy to add new applications and services

---

## 📁 **Directory Structure**

```
viewesta-platform/
├── 📱 apps/                          # Applications Layer
│   ├── backend/                       # Node.js API Server
│   │   ├── src/                       # Source code
│   │   │   ├── controllers/           # Request handlers
│   │   │   ├── middlewares/           # Express middleware
│   │   │   ├── models/                # Data models
│   │   │   ├── routes/                # API routes
│   │   │   ├── services/              # Business logic
│   │   │   ├── utils/                 # Utility functions
│   │   │   ├── config/                # Configuration
│   │   │   └── index.js               # Server entry point
│   │   ├── tests/                     # Test files
│   │   ├── docs/                      # API documentation
│   │   ├── package.json               # Backend dependencies
│   │   └── Dockerfile                 # Container configuration
│   │
│   ├── web-frontend/                  # React Web Application
│   │   ├── src/                       # React source code
│   │   ├── public/                    # Static assets
│   │   ├── package.json               # Frontend dependencies
│   │   └── Dockerfile                 # Container configuration
│   │
│   ├── mobile-app/                    # React Native Mobile App
│   │   ├── src/                       # Mobile source code
│   │   │   ├── components/            # Reusable components
│   │   │   ├── screens/               # App screens (18 screens)
│   │   │   ├── navigation/            # Navigation setup
│   │   │   ├── services/              # API services
│   │   │   ├── types/                 # TypeScript definitions
│   │   │   ├── utils/                 # Helper functions
│   │   │   └── constants/             # App constants
│   │   ├── assets/                    # Images, icons, fonts
│   │   ├── package.json               # Mobile dependencies
│   │   └── app.json                   # Expo configuration
│   │
│   ├── admin-dashboard/               # Admin Management Dashboard
│   └── filmmaker-dashboard/          # Filmmaker Dashboard
│
├── 📦 packages/                       # Shared Packages Layer
│   ├── database/                      # Database Package
│   │   ├── init.sql                   # Database schema
│   │   ├── seeds.sql                  # Sample data
│   │   ├── connection.js              # Connection pool
│   │   ├── setup.js                   # Setup automation
│   │   ├── test-connection.js         # Connection testing
│   │   ├── env.example                # Environment template
│   │   ├── package.json               # Database dependencies
│   │   └── SETUP_GUIDE.md             # Setup instructions
│   │
│   ├── shared/                        # Shared Utilities
│   │   ├── types/                     # Common TypeScript types
│   │   ├── utils/                     # Shared utility functions
│   │   ├── constants/                 # Shared constants
│   │   └── validators/                # Data validation schemas
│   │
│   └── ui-components/                 # Reusable UI Components
│       ├── components/                # React components
│       ├── styles/                    # Shared styles
│       └── themes/                    # Design system
│
├── 🏗️ infrastructure/                 # DevOps & Infrastructure
│   ├── docker/                        # Docker configurations
│   │   ├── docker-compose.yml         # Multi-service setup
│   │   ├── Dockerfile.backend         # Backend container
│   │   └── Dockerfile.frontend        # Frontend container
│   │
│   ├── aws/                           # AWS CloudFormation/Terraform
│   │   ├── rds/                       # Database infrastructure
│   │   ├── s3/                        # Storage infrastructure
│   │   ├── ec2/                       # Compute infrastructure
│   │   └── cloudfront/                 # CDN configuration
│   │
│   └── scripts/                       # Deployment scripts
│       ├── deploy.sh                  # Deployment automation
│       ├── backup.sh                  # Database backup
│       └── monitoring.sh              # Health checks
│
├── 📚 docs/                           # Documentation
│   ├── daily-reports/                 # Daily development reports
│   │   └── day-2/                     # Day 2 specific docs
│   ├── planning/                      # Project planning documents
│   │   ├── Viewesta Phase1 Requirements.md
│   │   ├── Viewesta_Deep_Workflow.md
│   │   └── Viewesta All system Diagram.md
│   ├── api/                           # API documentation
│   ├── deployment/                    # Deployment guides
│   └── architecture/                  # Architecture diagrams
│
├── 🛠️ tools/                          # Development Tools
│   ├── converters/                    # PDF to Markdown converters
│   │   ├── pdf_to_md_converter.py
│   │   ├── simple_pdf_converter.py
│   │   ├── convert_pdfs_to_md.ps1
│   │   └── convert_pdfs.bat
│   │
│   ├── scripts/                       # Utility scripts
│   └── utilities/                     # Development utilities
│
├── 📄 Root Files                      # Project Configuration
│   ├── package.json                   # Monorepo configuration
│   ├── README.md                      # Project overview
│   ├── .gitignore                     # Git ignore rules
│   ├── docker-compose.yml             # Development environment
│   ├── env.template                   # Environment template
│   └── setup-dev.js                   # Development setup
```

---

## 🎯 **Application Details**

### **Backend API (`apps/backend/`)**
**Technology Stack**: Node.js + Express.js + PostgreSQL  
**Purpose**: RESTful API server for all platform operations  
**Key Features**:
- Security middleware (Helmet, CORS, Rate Limiting)
- Database connection pool
- Error handling and logging
- Health check endpoints
- JWT authentication ready

**Current Status**: ✅ Basic server structure complete  
**Next**: Day 3 - Authentication implementation

### **Web Frontend (`apps/web-frontend/`)**
**Technology Stack**: React.js + TypeScript  
**Purpose**: Web application for viewers and filmmakers  
**Key Features**:
- Responsive design
- Movie browsing and streaming
- User authentication
- Payment integration
- Admin and filmmaker dashboards

**Current Status**: ✅ Package configuration complete  
**Next**: Day 5 - Frontend development

### **Mobile App (`apps/mobile-app/`)**
**Technology Stack**: React Native + Expo  
**Purpose**: iOS and Android mobile application  
**Key Features**:
- 18 complete screens implemented
- Navigation system
- Video player integration
- Offline download capability
- Push notifications

**Current Status**: ✅ Complete screen set and navigation  
**Next**: Day 7 - Mobile app integration

### **Admin Dashboard (`apps/admin-dashboard/`)**
**Technology Stack**: React.js + Admin UI  
**Purpose**: Platform administration and content moderation  
**Key Features**:
- User management
- Content approval
- Analytics dashboard
- Payment monitoring
- Platform settings

**Current Status**: ✅ Directory structure ready  
**Next**: Day 6 - Admin dashboard development

### **Filmmaker Dashboard (`apps/filmmaker-dashboard/`)**
**Technology Stack**: React.js + Dashboard UI  
**Purpose**: Filmmaker content management and analytics  
**Key Features**:
- Movie upload management
- Revenue tracking
- Performance analytics
- Payout requests
- Content promotion

**Current Status**: ✅ Directory structure ready  
**Next**: Day 6 - Filmmaker dashboard development

---

## 📦 **Package Details**

### **Database Package (`packages/database/`)**
**Purpose**: Centralized database management  
**Key Components**:
- **Schema**: Complete PostgreSQL schema (14 tables)
- **Connection**: Pool management and utilities
- **Setup**: Automated database initialization
- **Testing**: Connection and operation testing
- **Documentation**: Setup guides and troubleshooting

**Current Status**: ✅ 100% Complete  
**Features**:
- UUID primary keys
- Foreign key constraints
- Performance indexes
- Automatic timestamps
- Sample data

### **Shared Package (`packages/shared/`)**
**Purpose**: Common utilities and types  
**Key Components**:
- **Types**: TypeScript interfaces for all entities
- **Utils**: Shared utility functions
- **Constants**: Common constants and configurations
- **Validators**: Data validation schemas

**Current Status**: ✅ Structure ready  
**Next**: Day 3 - Authentication types and utilities

### **UI Components Package (`packages/ui-components/`)**
**Purpose**: Reusable UI components  
**Key Components**:
- **Components**: React components for common UI elements
- **Styles**: Shared styling system
- **Themes**: Design system and theming
- **Icons**: Icon library and components

**Current Status**: ✅ Structure ready  
**Next**: Day 4 - Component library development

---

## 🔧 **Development Workflow**

### **Monorepo Commands**
```bash
# Install all dependencies
npm run install:all

# Start all development servers
npm run dev

# Start individual services
npm run dev:backend
npm run dev:web
npm run dev:mobile

# Build all applications
npm run build

# Run all tests
npm run test

# Lint all code
npm run lint

# Format all code
npm run format
```

### **Individual App Commands**
```bash
# Backend
cd apps/backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests

# Web Frontend
cd apps/web-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests

# Mobile App
cd apps/mobile-app
npm run start        # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

### **Package Commands**
```bash
# Database
cd packages/database
npm run setup        # Setup database
npm run test         # Test connection
npm run init         # Initialize schema
npm run seed         # Add sample data
```

---

## 🚀 **Deployment Architecture**

### **Development Environment**
- **Local PostgreSQL**: Database running locally
- **Docker Compose**: Multi-service development setup
- **Hot Reload**: All services support hot reloading
- **Environment**: Development configuration

### **Production Environment**
- **AWS RDS**: PostgreSQL database
- **AWS S3**: File storage
- **AWS CloudFront**: CDN for static assets
- **AWS EC2**: Backend API server
- **Docker**: Containerized deployment

---

## 📋 **Team Collaboration**

### **For New Team Members**
1. **Clone Repository**: `git clone [repository-url]`
2. **Run Setup**: `npm run setup`
3. **Start Development**: `npm run dev`
4. **Read Documentation**: Check `docs/` directory
5. **Review Daily Reports**: Check `docs/daily-reports/`

### **Development Guidelines**
- **Code Organization**: Follow established folder structure
- **Documentation**: Update docs for any structural changes
- **Testing**: Write tests for new features
- **Commits**: Use conventional commit messages
- **Pull Requests**: Include documentation updates

### **File Naming Conventions**
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)
- **Types**: PascalCase (`UserType.ts`)
- **Files**: kebab-case (`user-service.js`)

---

## 🎯 **Next Steps**

### **Day 3 Preparation**
- Review backend authentication requirements
- Plan API endpoint structure
- Prepare JWT and bcrypt integration
- Design user registration/login flow

### **Future Development**
- **Day 4**: Core API endpoints
- **Day 5**: Web frontend development
- **Day 6**: Dashboard implementations
- **Day 7**: Mobile app integration
- **Day 8**: Testing and deployment

---

**Structure Documentation Created**: October 26, 2025  
**For**: Day 2 Project Organization  
**Next**: Day 3 Authentication Implementation
