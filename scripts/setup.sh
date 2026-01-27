#!/bin/bash

# Setup script for SaaS Platform
# This script helps you quickly set up the development environment

set -e

echo "🚀 SaaS Platform Setup Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

MISSING_DEPS=0

if command_exists docker; then
    print_success "Docker is installed ($(docker --version))"
else
    print_error "Docker is not installed"
    MISSING_DEPS=1
fi

if command_exists docker-compose; then
    print_success "Docker Compose is installed ($(docker-compose --version))"
else
    print_error "Docker Compose is not installed"
    MISSING_DEPS=1
fi

if command_exists node; then
    print_success "Node.js is installed ($(node --version))"
else
    print_error "Node.js is not installed"
    MISSING_DEPS=1
fi

if command_exists npm; then
    print_success "npm is installed ($(npm --version))"
else
    print_error "npm is not installed"
    MISSING_DEPS=1
fi

if command_exists git; then
    print_success "Git is installed ($(git --version))"
else
    print_error "Git is not installed"
    MISSING_DEPS=1
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    print_error "Some prerequisites are missing. Please install them and run this script again."
    exit 1
fi

echo ""
print_success "All prerequisites are installed!"
echo ""

# Setup environment variables
echo "Setting up environment variables..."
if [ -f .env ]; then
    print_info ".env file already exists. Skipping..."
else
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_info "Please update .env with your configuration"
fi

echo ""

# Ask user if they want to use Docker or local setup
echo "How do you want to run the application?"
echo "1) Docker Compose (recommended for quick start)"
echo "2) Local development (requires manual setup)"
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        print_info "Setting up with Docker Compose..."
        echo ""
        
        # Build Docker images
        print_info "Building Docker images..."
        docker-compose build
        print_success "Docker images built successfully"
        
        echo ""
        print_info "Starting services..."
        docker-compose up -d
        print_success "Services started successfully"
        
        echo ""
        print_success "Application is running!"
        echo ""
        echo "Access the application:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5000"
        echo "  API Docs: http://localhost:5000/api-docs"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop services: docker-compose down"
        ;;
    2)
        echo ""
        print_info "Setting up for local development..."
        echo ""
        
        # Install backend dependencies
        print_info "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
        
        echo ""
        
        # Install frontend dependencies
        print_info "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
        
        echo ""
        print_success "Local setup complete!"
        echo ""
        echo "To run the application:"
        echo "  Backend: cd backend && npm run dev"
        echo "  Frontend: cd frontend && npm start"
        echo ""
        print_info "Note: Make sure PostgreSQL and Redis are running locally"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=============================="
print_success "Setup completed successfully!"
echo "=============================="
echo ""
print_info "Next steps:"
echo "  1. Review and update .env file with your configuration"
echo "  2. Check the documentation in README.md"
echo "  3. Visit the application in your browser"
echo ""
print_info "For help, visit: https://github.com/Vivek-122005/Devops-project-saas-tool"
echo ""
