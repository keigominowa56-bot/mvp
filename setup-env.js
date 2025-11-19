const fs = require('fs');
const path = require('path');

// Create backend .env file
const backendEnv = `# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=transparency_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=24h

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour_firebase_private_key\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id

# Twitter API Configuration (Optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
SKIP_DATABASE=true
`;

// Create frontend .env.local file
const frontendEnv = `# Firebase Configuration (Demo values - replace with real ones)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
`;

try {
  // Write backend .env
  fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
  console.log('✅ Created backend/.env file');
  
  // Write frontend .env.local
  fs.writeFileSync(path.join(__dirname, 'frontend', '.env.local'), frontendEnv);
  console.log('✅ Created frontend/.env.local file');
  
  console.log('\n📝 Next steps:');
  console.log('1. Update the environment variables with your actual values');
  console.log('2. Set up your Firebase project and add the credentials');
  console.log('3. Configure your MySQL database');
  console.log('4. Run: cd backend && npm install && npm run start:dev');
  console.log('5. Run: cd frontend && npm install && npm run dev');
  
} catch (error) {
  console.error('Error creating environment files:', error);
}
