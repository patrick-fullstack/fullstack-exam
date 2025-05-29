import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';
import { env } from '../config/env';

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(env.MONGO_URI);
    
    // Check if admin exists
    const adminExists = await User.findOne({ role: UserRole.SUPER_ADMIN });
    
    if (adminExists) {
      console.log('Admin already exists!');
      return;
    }
    
    // Create admin
    await User.create({
      email: 'admin@admin.com',
      password: 'SecuredPass@123',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true
    });
    
    console.log('Admin created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();