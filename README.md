# ShopEase - Modern E-Commerce Platform

A complete e-commerce application built with microservices architecture using Docker and Node.js.

## 🚀 Features

- **Modern UI**: Beautiful, responsive frontend with modern design
- **User Authentication**: JWT-based authentication system
- **Product Catalog**: Complete product management with categories
- **Shopping Cart**: Full cart functionality with quantity management
- **Payment Processing**: Integrated payment service with multiple payment methods
- **Order Management**: Complete order tracking and management
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Works perfectly on all devices

## 🏗️ Architecture

This application follows a microservices architecture with 4 main services:

### Services

1. **Frontend Service** (Port 3000)
   - Modern HTML/CSS/JavaScript UI
   - Nginx web server
   - Responsive design
   - Shopping cart functionality

2. **Backend API Service** (Port 5000)
   - Node.js/Express REST API
   - User authentication & authorization
   - Product management
   - Order processing
   - MongoDB integration

3. **Payment Service** (Port 5001)
   - Payment processing
   - Transaction management
   - Multiple payment methods
   - Refund handling

4. **MongoDB Database** (Port 27017)
   - User data
   - Product catalog
   - Order history
   - Transaction records

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Font Awesome, Google Fonts
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Payment**: Custom payment processing service
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx

## 📦 Installation & Setup

### Prerequisites

- Docker Desktop
- Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecommerce-app
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Payment Service: http://localhost:5001
   - MongoDB: localhost:27017

### Manual Setup (Development)

1. **Install dependencies for each service**
   ```bash
   # Backend
   cd backend
   npm install

   # Payment Service
   cd ../payment-service
   npm install
   ```

2. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update connection string in backend/server.js

3. **Start services individually**
   ```bash
   # Backend
   cd backend
   npm start

   # Payment Service
   cd ../payment-service
   npm start

   # Frontend (serve with any static server)
   cd ../frontend
   npx serve .
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
MONGODB_URI=mongodb://mongodb:27017/ecommerce
JWT_SECRET=your-secret-key-here
PORT=5000

# Payment Service
PORT=5001
```

### Docker Configuration

The application uses Docker Compose for orchestration. Key configurations:

- **Networks**: All services communicate via `ecommerce-network`
- **Volumes**: MongoDB data is persisted using Docker volumes
- **Ports**: Services are exposed on different ports for easy access

## 📱 API Endpoints

### Backend API (Port 5000)

#### Authentication
- `POST /register` - User registration
- `POST /login` - User login

#### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product

#### Orders
- `POST /orders` - Create new order (requires auth)
- `GET /orders` - Get user orders (requires auth)

#### Health Check
- `GET /health` - Service health status

### Payment Service (Port 5001)

#### Payment Processing
- `POST /process-payment` - Process payment
- `GET /transaction/:id` - Get transaction status
- `POST /refund` - Process refund
- `GET /payment-methods` - Get available payment methods

#### Health Check
- `GET /health` - Service health status

## 🎨 Frontend Features

### User Interface
- **Modern Design**: Clean, professional e-commerce design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, animations, and transitions
- **Search Functionality**: Real-time product search
- **Filtering**: Sort products by price, popularity, etc.

### Shopping Experience
- **Product Catalog**: Display products with images, prices, ratings
- **Shopping Cart**: Add/remove items, quantity management
- **User Authentication**: Login/register modal
- **Checkout Process**: Simulated payment processing
- **Order Confirmation**: Success messages and notifications

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **CORS Protection**: Cross-origin resource sharing configuration
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

### Products Collection
```javascript
{
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  rating: Number,
  reviews: Number,
  badge: String,
  stock: Number,
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  userId: ObjectId (ref: User),
  products: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String,
  createdAt: Date
}
```

## 🚀 Deployment

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

2. **Scale services (optional)**
   ```bash
   docker-compose up -d --scale backend=3
   ```

### Production Deployment

1. **Set up production environment variables**
2. **Configure MongoDB for production**
3. **Set up reverse proxy (Nginx/Apache)**
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

## 🧪 Testing

### Manual Testing

1. **Frontend Testing**
   - Test responsive design on different devices
   - Verify all interactive elements work
   - Test search and filtering functionality

2. **API Testing**
   - Test all endpoints with Postman or similar tool
   - Verify authentication works correctly
   - Test error handling

3. **Integration Testing**
   - Test complete user journey (register → login → shop → checkout)
   - Verify payment processing
   - Test order creation and retrieval

## 🔧 Development

### Adding New Features

1. **Frontend Changes**
   - Modify files in `frontend/` directory
   - Rebuild Docker image: `docker-compose build frontend`

2. **Backend Changes**
   - Modify files in `backend/` directory
   - Rebuild Docker image: `docker-compose build backend`

3. **Payment Service Changes**
   - Modify files in `payment-service/` directory
   - Rebuild Docker image: `docker-compose build payment`

### Debugging

1. **View logs**
   ```bash
   docker-compose logs -f [service-name]
   ```

2. **Access container shell**
   ```bash
   docker-compose exec [service-name] sh
   ```

3. **Check service health**
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:5001/health
   ```

## 📈 Monitoring

### Health Checks
- All services have `/health` endpoints
- Docker Compose health checks configured
- Automatic restart on failure

### Logging
- Console logging for all services
- Structured logging format
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@shopease.com

## 🔄 Updates

### Version 1.0.0
- Initial release
- Basic e-commerce functionality
- Microservices architecture
- Docker deployment

### Planned Features
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Real payment gateway integration

---

**ShopEase** - Your modern e-commerce solution! 🛒✨ #   m y - a p p  
 