import mongoose from 'mongoose';
import { User, Profile, Project, ProjectMember, Task } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';
import { config } from '../config/environment.js';

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongoUri);
    console.log('📡 Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Project.deleteMany({}),
      ProjectMember.deleteMany({}),
      Task.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data...');

    // Create users and profiles
    const hashedPassword = await hashPassword('password123');

    // Admin user
    const adminUser = new User({
      email: 'admin@omyra.com',
      password: hashedPassword
    });
    await adminUser.save();

    const adminProfile = new Profile({
      user: adminUser._id,
      fullName: 'System Administrator',
      email: 'admin@omyra.com',
      role: 'admin'
    });
    await adminProfile.save();
    adminUser.profile = adminProfile._id as any;
    await adminUser.save();

    // Project Manager user
    const pmUser = new User({
      email: 'pm@omyra.com',
      password: hashedPassword
    });
    await pmUser.save();

    const pmProfile = new Profile({
      user: pmUser._id,
      fullName: 'Project Manager',
      email: 'pm@omyra.com',
      role: 'project_manager'
    });
    await pmProfile.save();
    pmUser.profile = pmProfile._id as any;
    await pmUser.save();

    // Team Member users
    const member1User = new User({
      email: 'developer@omyra.com',
      password: hashedPassword
    });
    await member1User.save();

    const member1Profile = new Profile({
      user: member1User._id,
      fullName: 'Senior Developer',
      email: 'developer@omyra.com',
      role: 'team_member'
    });
    await member1Profile.save();
    member1User.profile = member1Profile._id as any;
    await member1User.save();

    const member2User = new User({
      email: 'designer@omyra.com',
      password: hashedPassword
    });
    await member2User.save();

    const member2Profile = new Profile({
      user: member2User._id,
      fullName: 'UI/UX Designer',
      email: 'designer@omyra.com',
      role: 'team_member'
    });
    await member2Profile.save();
    member2User.profile = member2Profile._id as any;
    await member2User.save();

    console.log('👥 Created users and profiles...');

    // Create projects
    const project1 = new Project({
      title: 'E-commerce Platform',
      description: 'Modern e-commerce platform with advanced features',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      createdBy: pmUser._id
    });
    await project1.save();

    const project2 = new Project({
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application',
      status: 'planning',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      createdBy: pmUser._id
    });
    await project2.save();

    const project3 = new Project({
      title: 'API Modernization',
      description: 'Upgrade legacy APIs to modern standards',
      status: 'active',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-30'),
      createdBy: adminUser._id
    });
    await project3.save();

    console.log('📁 Created projects...');

    // Create project members
    const projectMembers = [
      // Project 1 members
      { project: project1._id, user: pmUser._id, roleInProject: 'owner' },
      { project: project1._id, user: member1User._id, roleInProject: 'developer' },
      { project: project1._id, user: member2User._id, roleInProject: 'designer' },
      
      // Project 2 members
      { project: project2._id, user: pmUser._id, roleInProject: 'owner' },
      { project: project2._id, user: member1User._id, roleInProject: 'developer' },
      
      // Project 3 members
      { project: project3._id, user: adminUser._id, roleInProject: 'owner' },
      { project: project3._id, user: member1User._id, roleInProject: 'developer' }
    ];

    await ProjectMember.insertMany(projectMembers);
    console.log('👥 Created project memberships...');

    // Create tasks
    const tasks = [
      // Project 1 tasks
      {
        title: 'Setup Database Schema',
        description: 'Design and implement the database schema for the e-commerce platform',
        status: 'done',
        priority: 'high',
        project: project1._id,
        assignedTo: member1User._id,
        createdBy: pmUser._id,
        dueDate: new Date('2024-01-15')
      },
      {
        title: 'Design Product Catalog UI',
        description: 'Create wireframes and mockups for the product catalog',
        status: 'in_progress',
        priority: 'medium',
        project: project1._id,
        assignedTo: member2User._id,
        createdBy: pmUser._id,
        dueDate: new Date('2024-02-01')
      },
      {
        title: 'Implement User Authentication',
        description: 'Build secure user authentication system',
        status: 'todo',
        priority: 'high',
        project: project1._id,
        assignedTo: member1User._id,
        createdBy: pmUser._id,
        dueDate: new Date('2024-02-15')
      },
      {
        title: 'Payment Gateway Integration',
        description: 'Integrate multiple payment gateways',
        status: 'todo',
        priority: 'urgent',
        project: project1._id,
        assignedTo: member1User._id,
        createdBy: pmUser._id,
        dueDate: new Date('2024-03-01')
      },

      // Project 2 tasks
      {
        title: 'Mobile App Architecture',
        description: 'Define the overall architecture for the mobile application',
        status: 'in_progress',
        priority: 'high',
        project: project2._id,
        assignedTo: member1User._id,
        createdBy: pmUser._id,
        dueDate: new Date('2024-03-15')
      },
      {
        title: 'UI/UX Design System',
        description: 'Create a comprehensive design system for the mobile app',
        status: 'todo',
        priority: 'medium',
        project: project2._id,
        assignedTo: member2User._id,
        createdBy: pmUser._id,
        dueDate: new Date('2024-04-01')
      },

      // Project 3 tasks
      {
        title: 'API Documentation Audit',
        description: 'Review and update all API documentation',
        status: 'done',
        priority: 'medium',
        project: project3._id,
        assignedTo: member1User._id,
        createdBy: adminUser._id,
        dueDate: new Date('2024-02-15')
      },
      {
        title: 'Migrate to REST Standards',
        description: 'Update APIs to follow REST best practices',
        status: 'in_progress',
        priority: 'high',
        project: project3._id,
        assignedTo: member1User._id,
        createdBy: adminUser._id,
        dueDate: new Date('2024-04-01')
      }
    ];

    await Task.insertMany(tasks);
    console.log('📋 Created tasks...');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Seeded Data Summary:');
    console.log('• Users: 4 (1 admin, 1 project manager, 2 team members)');
    console.log('• Projects: 3');
    console.log('• Tasks: 8');
    console.log('\n🔐 Test Credentials:');
    console.log('• Admin: admin@omyra.com / password123');
    console.log('• Project Manager: pm@omyra.com / password123');
    console.log('• Developer: developer@omyra.com / password123');
    console.log('• Designer: designer@omyra.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

seedData();
