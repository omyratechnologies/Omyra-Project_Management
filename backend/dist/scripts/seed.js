import mongoose from 'mongoose';
import { User, Profile, Project, ProjectMember, Task } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';
import { config } from '../config/environment.js';
const seedData = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('📡 Connected to MongoDB for seeding...');
        await Promise.all([
            User.deleteMany({}),
            Profile.deleteMany({}),
            Project.deleteMany({}),
            ProjectMember.deleteMany({}),
            Task.deleteMany({})
        ]);
        console.log('🗑️  Cleared existing data...');
        const hashedPassword = await hashPassword('password123');
        const adminUser = new User({
            email: 'admin@omyra.com',
            password: hashedPassword
        });
        await adminUser.save();
        const adminProfile = new Profile({
            user: adminUser.id,
            fullName: 'System Administrator',
            email: 'admin@omyra.com',
            role: 'admin'
        });
        await adminProfile.save();
        adminUser.profile = adminProfile.id;
        await adminUser.save();
        const pmUser = new User({
            email: 'pm@omyra.com',
            password: hashedPassword
        });
        await pmUser.save();
        const pmProfile = new Profile({
            user: pmUser.id,
            fullName: 'Project Manager',
            email: 'pm@omyra.com',
            role: 'project_manager'
        });
        await pmProfile.save();
        pmUser.profile = pmProfile.id;
        await pmUser.save();
        const member1User = new User({
            email: 'developer@omyra.com',
            password: hashedPassword
        });
        await member1User.save();
        const member1Profile = new Profile({
            user: member1User.id,
            fullName: 'Senior Developer',
            email: 'developer@omyra.com',
            role: 'team_member'
        });
        await member1Profile.save();
        member1User.profile = member1Profile.id;
        await member1User.save();
        const member2User = new User({
            email: 'designer@omyra.com',
            password: hashedPassword
        });
        await member2User.save();
        const member2Profile = new Profile({
            user: member2User.id,
            fullName: 'UI/UX Designer',
            email: 'designer@omyra.com',
            role: 'team_member'
        });
        await member2Profile.save();
        member2User.profile = member2Profile.id;
        await member2User.save();
        console.log('👥 Created users and profiles...');
        const project1 = new Project({
            title: 'E-commerce Platform',
            description: 'Modern e-commerce platform with advanced features',
            status: 'active',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-30'),
            createdBy: pmUser.id
        });
        await project1.save();
        const project2 = new Project({
            title: 'Mobile App Development',
            description: 'Cross-platform mobile application',
            status: 'planning',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-09-30'),
            createdBy: pmUser.id
        });
        await project2.save();
        const project3 = new Project({
            title: 'API Modernization',
            description: 'Upgrade legacy APIs to modern standards',
            status: 'active',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-05-30'),
            createdBy: adminUser.id
        });
        await project3.save();
        console.log('📁 Created projects...');
        const projectMembers = [
            { project: project1.id, user: pmUser.id, roleInProject: 'owner' },
            { project: project1.id, user: member1User.id, roleInProject: 'developer' },
            { project: project1.id, user: member2User.id, roleInProject: 'designer' },
            { project: project2.id, user: pmUser.id, roleInProject: 'owner' },
            { project: project2.id, user: member1User.id, roleInProject: 'developer' },
            { project: project3.id, user: adminUser.id, roleInProject: 'owner' },
            { project: project3.id, user: member1User.id, roleInProject: 'developer' }
        ];
        await ProjectMember.insertMany(projectMembers);
        console.log('👥 Created project memberships...');
        const tasks = [
            {
                title: 'Setup Database Schema',
                description: 'Design and implement the database schema for the e-commerce platform',
                status: 'done',
                priority: 'high',
                project: project1.id,
                assignedTo: member1User.id,
                createdBy: pmUser.id,
                dueDate: new Date('2024-01-15')
            },
            {
                title: 'Design Product Catalog UI',
                description: 'Create wireframes and mockups for the product catalog',
                status: 'in_progress',
                priority: 'medium',
                project: project1.id,
                assignedTo: member2User.id,
                createdBy: pmUser.id,
                dueDate: new Date('2024-02-01')
            },
            {
                title: 'Implement User Authentication',
                description: 'Build secure user authentication system',
                status: 'todo',
                priority: 'high',
                project: project1.id,
                assignedTo: member1User.id,
                createdBy: pmUser.id,
                dueDate: new Date('2024-02-15')
            },
            {
                title: 'Payment Gateway Integration',
                description: 'Integrate multiple payment gateways',
                status: 'todo',
                priority: 'urgent',
                project: project1.id,
                assignedTo: member1User.id,
                createdBy: pmUser.id,
                dueDate: new Date('2024-03-01')
            },
            {
                title: 'Mobile App Architecture',
                description: 'Define the overall architecture for the mobile application',
                status: 'in_progress',
                priority: 'high',
                project: project2.id,
                assignedTo: member1User.id,
                createdBy: pmUser.id,
                dueDate: new Date('2024-03-15')
            },
            {
                title: 'UI/UX Design System',
                description: 'Create a comprehensive design system for the mobile app',
                status: 'todo',
                priority: 'medium',
                project: project2.id,
                assignedTo: member2User.id,
                createdBy: pmUser.id,
                dueDate: new Date('2024-04-01')
            },
            {
                title: 'API Documentation Audit',
                description: 'Review and update all API documentation',
                status: 'done',
                priority: 'medium',
                project: project3.id,
                assignedTo: member1User.id,
                createdBy: adminUser.id,
                dueDate: new Date('2024-02-15')
            },
            {
                title: 'Migrate to REST Standards',
                description: 'Update APIs to follow REST best practices',
                status: 'in_progress',
                priority: 'high',
                project: project3.id,
                assignedTo: member1User.id,
                createdBy: adminUser.id,
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
        console.log('\n🆔 User IDs for API Testing:');
        console.log(`• Admin ID: ${adminUser.id}`);
        console.log(`• Project Manager ID: ${pmUser.id}`);
        console.log(`• Developer ID: ${member1User.id}`);
        console.log(`• Designer ID: ${member2User.id}`);
        console.log('\n📁 Project IDs:');
        console.log(`• E-commerce Platform: ${project1.id}`);
        console.log(`• Mobile App Development: ${project2.id}`);
        console.log(`• API Modernization: ${project3.id}`);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    }
};
seedData();
