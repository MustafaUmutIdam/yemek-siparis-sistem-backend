/**
 * Swagger yapılandırması
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yemek Sipariş Sistemi API',
      version: '1.0.0',
      description: 'Restorant sipariş sistemi API dokumentasyonu. 4 kullanıcı türü: Admin, Owner, Courier, Consumer',
      contact: {
        name: 'API Destek',
        email: 'support@yemeksiparis.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Geliştirme sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token ile kimlik doğrulama. "Authorization: Bearer YOUR_TOKEN" şeklinde kullanınız.'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Kimlik doğrulama işlemleri (Login/Register)'
      },
      {
        name: 'Admin',
        description: 'Admin paneli - Owner yönetimi'
      },
      {
        name: 'Owner',
        description: 'Owner - restoran yönetimi'
      },
      {
        name: 'Products',
        description: 'Product yönetimi (owner)'
      },
      {
        name: 'Couriers',
        description: 'Courier yönetimi (owner)'
      },
      {
        name: 'Orders',
        description: 'Order lifecycle'
      },
      {
        name: 'Consumers',
        description: 'Consumer operations and restaurant search'
      }
         ]
  },
  apis: [
    './src/routes/auth.js',
    './src/routes/admin.js',
    './src/routes/owner.js',
    './src/routes/products.js',
    './src/routes/couriers.js',
    './src/routes/orders.js',
    './src/routes/consumers.js'
  ]
};
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
