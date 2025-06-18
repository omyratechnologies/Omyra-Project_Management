import mongoose from 'mongoose';
import { User, Profile, Project, ProjectMember, Task, Client } from './src/models/index.js';
import { hashPassword } from './src/utils/auth.js';
import { config } from './src/config/environment.js';

const seedAdminData = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongoUri);
    console.log('📡 Connected to MongoDB for admin seeding...');

    const hashedPassword = await hashPassword('admin123');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'superadmin@omyra.com' });
    let adminUser2;
    
    if (!existingSuperAdmin) {
      // Create additional admin user for testing
      adminUser2 = new User({
        email: 'superadmin@omyra.com',
        password: hashedPassword
      });
      await adminUser2.save();

      const adminProfile2 = new Profile({
        user: adminUser2.id,
        fullName: 'Super Administrator',
        email: 'superadmin@omyra.com',
        role: 'admin',
        status: 'active'
      });
      await adminProfile2.save();
      adminUser2.profile = adminProfile2.id as any;
      await adminUser2.save();
      console.log('✅ Created super admin user');
    } else {
      adminUser2 = existingSuperAdmin;
      console.log('ℹ️  Super admin already exists');
    }

    // Check if client users already exist
    const existingClient1 = await User.findOne({ email: 'client1@testcorp.com' });
    const existingClient2 = await User.findOne({ email: 'client2@innovate.com' });

    let clientUser1, clientUser2;
    
    if (!existingClient1) {
      // Create some test clients with projects
      clientUser1 = new User({
        email: 'client1@testcorp.com',
        password: hashedPassword
      });
      await clientUser1.save();

      const clientProfile1 = new Profile({
        user: clientUser1.id,
        fullName: 'John Corporate',
        email: 'client1@testcorp.com',
        role: 'client',
        status: 'active'
      });
      await clientProfile1.save();
      clientUser1.profile = clientProfile1.id as any;
      await clientUser1.save();

      const client1 = new Client({
        user: clientUser1.id,
        companyName: 'Test Corporation',
        industry: 'Software',
        website: 'https://testcorp.com',
        phone: '+1-555-0101',
        address: {
          street: '123 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94102'
        },
        contactPerson: {
          name: 'John Corporate',
          title: 'CEO',
          email: 'client1@testcorp.com',
          phone: '+1-555-0101'
        },
        status: 'active',
        billingInfo: {
          billingEmail: 'billing@testcorp.com',
          paymentTerms: 'net-30'
        }
      });
      await client1.save();
      console.log('✅ Created Test Corporation client');
    } else {
      clientUser1 = existingClient1;
      console.log('ℹ️  Test Corporation client already exists');
    }

    if (!existingClient2) {
      // Create another client
      clientUser2 = new User({
        email: 'client2@innovate.com',
        password: hashedPassword
      });
      await clientUser2.save();

      const clientProfile2 = new Profile({
        user: clientUser2.id,
        fullName: 'Sarah Innovation',
        email: 'client2@innovate.com',
        role: 'client',
        status: 'inactive'
      });
      await clientProfile2.save();
      clientUser2.profile = clientProfile2.id as any;
      await clientUser2.save();

      const client2 = new Client({
        user: clientUser2.id,
        companyName: 'Innovate Solutions',
        industry: 'Consulting',
        website: 'https://innovate.com',
        phone: '+1-555-0202',
        address: {
          street: '456 Innovation St',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '73301'
        },
        contactPerson: {
          name: 'Sarah Innovation',
          title: 'CTO',
          email: 'client2@innovate.com',
          phone: '+1-555-0202'
        },
        status: 'pending',
        billingInfo: {
          billingEmail: 'finance@innovate.com',
          paymentTerms: 'net-15'
        }
      });
      await client2.save();
      console.log('✅ Created Innovate Solutions client');
    } else {
      clientUser2 = existingClient2;
      console.log('ℹ️  Innovate Solutions client already exists');
    }

    // Check if client projects already exist
    const existingProject1 = await Project.findOne({ title: 'Test Corp Website Redesign' });
    const existingProject2 = await Project.findOne({ title: 'Innovate Solutions CRM' });

    if (!existingProject1) {
      // Create client-specific projects
      const clientProject1 = new Project({
        title: 'Test Corp Website Redesign',
        description: 'Complete website redesign and modernization',
        status: 'active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
        createdBy: adminUser2.id
      });
      await clientProject1.save();

      // Create some tasks for client projects
      const task1 = new Task({
        title: 'Design Review with Client',
        description: 'Present initial design concepts to Test Corp',
        status: 'todo',
        priority: 'high',
        project: clientProject1.id,
        createdBy: adminUser2.id,
        dueDate: new Date('2024-02-01')
      });
      await task1.save();
      console.log('✅ Created Test Corp project and tasks');
    }

    if (!existingProject2) {
      const clientProject2 = new Project({
        title: 'Innovate Solutions CRM',
        description: 'Custom CRM system development',
        status: 'planning',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-01'),
        createdBy: adminUser2.id
      });
      await clientProject2.save();

      const task2 = new Task({
        title: 'Requirements Gathering',
        description: 'Collect detailed requirements from Innovate Solutions',
        status: 'in_progress',
        priority: 'medium',
        project: clientProject2.id,
        createdBy: adminUser2.id,
        dueDate: new Date('2024-03-15')
      });
      await task2.save();
      console.log('✅ Created Innovate Solutions project and tasks');
    }

    console.log('\n🎉 Admin seed data created successfully!');
    console.log('\n📋 Additional Data Created:');
    console.log('• Super Admin: superadmin@omyra.com / admin123');
    console.log('• Test Client 1: client1@testcorp.com / admin123 (Active)');
    console.log('• Test Client 2: client2@innovate.com / admin123 (Inactive Profile, Pending Client)');
    console.log('• Client Projects: 2');
    console.log('• Client Tasks: 2');

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

seedAdminData();
