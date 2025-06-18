import { User, Profile, Project, ProjectMember, Task, Client, ActivityLog } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emailService } from '../services/emailService.js';
import mongoose from 'mongoose';
// Dashboard Statistics
export const getDashboardStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        // Get all statistics in parallel
        const [totalUsers, totalProjects, totalTasks, totalClients, activeProjects, completedProjects, pendingTasks, completedTasks, usersByRole, projectsByStatus, tasksByStatus, clientsByStatus, recentUsers, recentProjects] = await Promise.all([
            User.countDocuments(),
            Project.countDocuments(),
            Task.countDocuments(),
            Client.countDocuments(),
            Project.countDocuments({ status: 'active' }),
            Project.countDocuments({ status: 'completed' }),
            Task.countDocuments({ status: { $in: ['todo', 'in_progress'] } }),
            Task.countDocuments({ status: 'done' }),
            Profile.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Project.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Task.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Client.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            User.find()
                .populate('profile', 'fullName role')
                .sort({ createdAt: -1 })
                .limit(5),
            Project.find()
                .populate('createdBy', 'email')
                .populate({
                path: 'createdBy',
                populate: { path: 'profile', select: 'fullName' }
            })
                .sort({ createdAt: -1 })
                .limit(5)
        ]);
        const stats = {
            overview: {
                totalUsers,
                totalProjects,
                totalTasks,
                totalClients,
                activeProjects,
                completedProjects,
                pendingTasks,
                completedTasks
            },
            distributions: {
                usersByRole,
                projectsByStatus,
                tasksByStatus,
                clientsByStatus
            },
            recent: {
                users: recentUsers,
                projects: recentProjects
            }
        };
        successResponse(res, 'Dashboard statistics retrieved successfully', stats);
    }
    catch (error) {
        next(error);
    }
};
// User Management
export const getAllUsers = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { page = 1, limit = 20, role, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build filter
        const filter = {};
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const [users, total] = await Promise.all([
            Profile.find(filter)
                .populate('user', 'email createdAt updatedAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Profile.countDocuments(filter)
        ]);
        const response = {
            users,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: users.length,
                totalCount: total
            }
        };
        successResponse(res, 'Users retrieved successfully', response);
    }
    catch (error) {
        next(error);
    }
};
export const createUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { email, password, fullName, role = 'team_member' } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User already exists with this email', undefined, 400);
            return;
        }
        // Hash password
        const hashedPassword = await hashPassword(password);
        // Create user
        const user = new User({
            email,
            password: hashedPassword
        });
        // Create profile
        const profile = new Profile({
            user: user.id,
            fullName,
            email,
            role
        });
        // Save both documents
        await user.save();
        await profile.save();
        // Update user with profile reference
        user.profile = profile.id;
        await user.save();
        // Send welcome email
        emailService.sendWelcomeEmail(email, {
            fullName,
            password,
            role
        }, { role: 'admin' }).catch((error) => {
            console.error('Failed to send welcome email:', error);
        });
        const populatedProfile = await Profile.findById(profile.id)
            .populate('user', 'email createdAt');
        successResponse(res, 'User created successfully', populatedProfile, 201);
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        const { fullName, email, role, status } = req.body;
        // Try to find profile by User ID first, then by Profile ID
        let profile = await Profile.findOne({ user: userId });
        let actualUserId = userId;
        if (!profile) {
            // Try finding by Profile ID
            profile = await Profile.findById(userId);
            if (profile) {
                actualUserId = profile.user.toString();
            }
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Update profile fields
        if (fullName)
            profile.fullName = fullName;
        if (role)
            profile.role = role;
        await profile.save();
        // Update user email if changed
        if (email) {
            await User.findByIdAndUpdate(actualUserId, { email });
        }
        const updatedProfile = await Profile.findById(profile._id)
            .populate('user', 'email createdAt updatedAt');
        successResponse(res, 'User updated successfully', updatedProfile);
    }
    catch (error) {
        next(error);
    }
};
export const deleteUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        // Try to find profile by User ID first, then by Profile ID
        let profile = await Profile.findOne({ user: userId });
        let actualUserId = userId;
        if (!profile) {
            // Try finding by Profile ID
            profile = await Profile.findById(userId);
            if (profile) {
                actualUserId = profile.user.toString();
            }
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Prevent deleting own account
        if (actualUserId === req.user.id) {
            errorResponse(res, 'Cannot delete your own account', undefined, 400);
            return;
        }
        // Remove from all project memberships
        await ProjectMember.deleteMany({ user: actualUserId });
        // Reassign or delete tasks assigned to this user
        await Task.updateMany({ assignedTo: actualUserId }, { $unset: { assignedTo: 1 } });
        // Delete profile and user
        await Profile.findByIdAndDelete(profile._id);
        await User.findByIdAndDelete(actualUserId);
        successResponse(res, 'User deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
export const resetUserPassword = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        const { newPassword } = req.body;
        // Try to find profile by User ID first, then by Profile ID
        let profile = await Profile.findOne({ user: userId }).populate('user');
        let actualUserId = userId;
        if (!profile) {
            // Try finding by Profile ID
            profile = await Profile.findById(userId).populate('user');
            if (profile) {
                actualUserId = profile.user.toString();
            }
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        const hashedPassword = await hashPassword(newPassword);
        await User.findByIdAndUpdate(actualUserId, { password: hashedPassword });
        // Send password reset notification
        emailService.sendPasswordResetEmail(profile.user.email, profile.fullName, 'admin-reset').catch((error) => {
            console.error('Failed to send password reset confirmation:', error);
        });
        successResponse(res, 'Password reset successfully');
    }
    catch (error) {
        next(error);
    }
};
// Project Management
export const createProject = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const project = new Project({
            ...req.body,
            createdBy: req.user.id
        });
        await project.save();
        // Create project members if team members are provided
        if (req.body.teamMembers && Array.isArray(req.body.teamMembers)) {
            const projectMembers = req.body.teamMembers.map((userId) => ({
                project: project.id,
                user: userId,
                role: 'member'
            }));
            await ProjectMember.insertMany(projectMembers);
        }
        successResponse(res, 'Project created successfully', project);
    }
    catch (error) {
        next(error);
    }
};
export const updateProject = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { projectId } = req.params;
        const updates = req.body;
        const project = await Project.findByIdAndUpdate(projectId, { ...updates, updatedBy: req.user.id }, { new: true }).populate('createdBy', 'email profile');
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        // Update project members if team members are provided
        if (updates.teamMembers && Array.isArray(updates.teamMembers)) {
            // Remove existing members
            await ProjectMember.deleteMany({ project: projectId });
            // Add new members
            const projectMembers = updates.teamMembers.map((userId) => ({
                project: projectId,
                user: userId,
                role: 'member'
            }));
            await ProjectMember.insertMany(projectMembers);
        }
        successResponse(res, 'Project updated successfully', project);
    }
    catch (error) {
        next(error);
    }
};
export const deleteProject = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { projectId } = req.params;
        // Delete project members first
        await ProjectMember.deleteMany({ project: projectId });
        // Delete associated tasks
        await Task.deleteMany({ project: projectId });
        // Delete the project
        const project = await Project.findByIdAndDelete(projectId);
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        successResponse(res, 'Project deleted successfully', null);
    }
    catch (error) {
        next(error);
    }
};
export const getProjectDetails = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { projectId } = req.params;
        const project = await Project.findById(projectId)
            .populate('createdBy', 'email profile')
            .populate({
            path: 'members',
            populate: {
                path: 'user',
                select: 'email profile',
                populate: {
                    path: 'profile',
                    select: 'fullName role'
                }
            }
        });
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'email profile');
        const projectData = {
            ...project.toJSON(),
            tasks
        };
        successResponse(res, 'Project details retrieved successfully', projectData);
    }
    catch (error) {
        next(error);
    }
};
export const getAllProjects = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const projects = await Project.find(query)
            .populate('createdBy', 'email profile')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Project.countDocuments(query);
        successResponse(res, 'Projects retrieved successfully', {
            projects,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
// RBAC Management
export const getRoles = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const roles = [
            {
                name: 'admin',
                displayName: 'Administrator',
                description: 'Full system access with user and system management capabilities',
                permissions: [
                    'user.create', 'user.read', 'user.update', 'user.delete',
                    'project.create', 'project.read', 'project.update', 'project.delete',
                    'task.create', 'task.read', 'task.update', 'task.delete',
                    'client.create', 'client.read', 'client.update', 'client.delete',
                    'system.manage', 'rbac.manage'
                ]
            },
            {
                name: 'project_manager',
                displayName: 'Project Manager',
                description: 'Can create and manage projects and tasks',
                permissions: [
                    'project.create', 'project.read', 'project.update',
                    'task.create', 'task.read', 'task.update',
                    'client.read', 'team.read'
                ]
            },
            {
                name: 'team_member',
                displayName: 'Team Member',
                description: 'Can view assigned projects and update task status',
                permissions: [
                    'project.read', 'task.read', 'task.update.own',
                    'profile.update.own'
                ]
            },
            {
                name: 'client',
                displayName: 'Client',
                description: 'Can view assigned projects and provide feedback',
                permissions: [
                    'project.read.assigned', 'feedback.create',
                    'profile.update.own'
                ]
            }
        ];
        const roleStats = await Profile.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const rolesWithStats = roles.map(role => ({
            ...role,
            userCount: roleStats.find(stat => stat.id === role.name)?.count || 0
        }));
        successResponse(res, 'Roles retrieved successfully', rolesWithStats);
    }
    catch (error) {
        next(error);
    }
};
export const updateUserRole = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        const { role } = req.body;
        const validRoles = ['admin', 'project_manager', 'team_member', 'client'];
        if (!validRoles.includes(role)) {
            errorResponse(res, 'Invalid role specified', undefined, 400);
            return;
        }
        // Try to find profile by User ID first, then by Profile ID
        let profile = await Profile.findOne({ user: userId }).populate('user', 'email');
        if (!profile) {
            // Try finding by Profile ID
            profile = await Profile.findById(userId).populate('user', 'email');
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Update the role
        profile.role = role;
        await profile.save();
        successResponse(res, 'User role updated successfully', profile);
    }
    catch (error) {
        next(error);
    }
};
// Client Management
export const getAllClientsAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build filter
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { 'contactPerson.name': { $regex: search, $options: 'i' } },
                { 'contactPerson.email': { $regex: search, $options: 'i' } }
            ];
        }
        const [clients, total] = await Promise.all([
            Client.find(filter)
                .populate('user')
                .populate({
                path: 'user',
                populate: { path: 'profile', select: 'fullName role' }
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Client.countDocuments(filter)
        ]);
        const response = {
            clients,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: clients.length,
                totalCount: total
            }
        };
        successResponse(res, 'Clients retrieved successfully', response);
    }
    catch (error) {
        next(error);
    }
};
export const assignClientToProject = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { clientId, projectId } = req.params;
        const [client, project] = await Promise.all([
            Client.findById(clientId),
            Project.findById(projectId)
        ]);
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        // Add project to client's projects array if not already present
        if (!client.projects?.includes(new mongoose.Types.ObjectId(projectId))) {
            client.projects = client.projects || [];
            client.projects.push(new mongoose.Types.ObjectId(projectId));
            await client.save();
        }
        // Add client as project member with 'client' role
        const existingMembership = await ProjectMember.findOne({
            project: projectId,
            user: client.user
        });
        if (!existingMembership) {
            const projectMember = new ProjectMember({
                project: projectId,
                user: client.user,
                roleInProject: 'client'
            });
            await projectMember.save();
        }
        successResponse(res, 'Client assigned to project successfully');
    }
    catch (error) {
        next(error);
    }
};
export const removeClientFromProject = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { clientId, projectId } = req.params;
        const client = await Client.findById(clientId);
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        // Remove project from client's projects array
        client.projects = client.projects?.filter(p => p.toString() !== projectId) || [];
        await client.save();
        // Remove client from project members
        await ProjectMember.deleteOne({
            project: projectId,
            user: client.user
        });
        successResponse(res, 'Client removed from project successfully');
    }
    catch (error) {
        next(error);
    }
};
export const getClientProjects = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { clientId } = req.params;
        const client = await Client.findById(clientId)
            .populate({
            path: 'projects',
            populate: {
                path: 'createdBy',
                populate: { path: 'profile', select: 'fullName' }
            }
        });
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        successResponse(res, 'Client projects retrieved successfully', {
            client: {
                _id: client.id,
                companyName: client.companyName,
                contactPerson: client.contactPerson,
                status: client.status
            },
            projects: client.projects || []
        });
    }
    catch (error) {
        next(error);
    }
};
// Create Admin
export const createAdmin = async (req, res, next) => {
    try {
        const { email, password, fullName, role } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User with this email already exists', undefined, 400);
            return;
        }
        // Hash password and create user first
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            email,
            password: hashedPassword
        });
        // Create profile with proper user reference
        const profile = await Profile.create({
            user: user._id,
            fullName,
            role: 'admin'
        });
        // Update user with profile reference
        user.profile = profile._id;
        await user.save();
        // Send welcome email
        await emailService.sendWelcomeEmail(email, fullName, password);
        successResponse(res, 'Admin created successfully', { user, profile });
    }
    catch (error) {
        next(error);
    }
};
// Get Single Admin
export const getAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id)
            .populate('profile')
            .select('-password');
        if (!admin || !admin.profile) {
            errorResponse(res, 'Admin not found', undefined, 404);
            return;
        }
        // Check if the populated profile is an admin
        const profile = admin.profile;
        if (!profile || profile.role !== 'admin') {
            errorResponse(res, 'User is not an admin', undefined, 400);
            return;
        }
        successResponse(res, 'Admin retrieved successfully', admin);
    }
    catch (error) {
        next(error);
    }
};
// Get All Admin Users
export const listAdminUsers = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { 'profile.fullName': { $regex: search, $options: 'i' } }
                ]
            };
        }
        const admins = await User.find(query)
            .populate({
            path: 'profile',
            match: { role: 'admin' }
        })
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit);
        // Filter out users whose profile didn't match (non-admins)
        const filteredAdmins = admins.filter(admin => admin.profile);
        const total = await User.countDocuments(query);
        successResponse(res, 'Admins retrieved successfully', {
            admins: filteredAdmins,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
// Update Admin
export const updateAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fullName, email, status } = req.body;
        const admin = await User.findById(id).populate('profile');
        if (!admin) {
            errorResponse(res, 'Admin not found', undefined, 404);
            return;
        }
        const profile = admin.profile;
        if (!profile || profile.role !== 'admin') {
            errorResponse(res, 'User is not an admin', undefined, 400);
            return;
        }
        // Update profile
        if (fullName) {
            profile.fullName = fullName;
            await profile.save();
        }
        // Update user
        if (email) {
            admin.email = email;
        }
        await admin.save();
        const updatedAdmin = await User.findById(id)
            .populate('profile')
            .select('-password');
        successResponse(res, 'Admin updated successfully', updatedAdmin);
    }
    catch (error) {
        next(error);
    }
};
// Delete Admin
export const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id).populate('profile');
        if (!admin) {
            errorResponse(res, 'Admin not found', undefined, 404);
            return;
        }
        const profile = admin.profile;
        if (!profile || profile.role !== 'admin') {
            errorResponse(res, 'User is not an admin', undefined, 400);
            return;
        }
        // Check if this is the last admin
        const adminCount = await Profile.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            errorResponse(res, 'Cannot delete the last admin', undefined, 400);
            return;
        }
        // Delete profile and user
        await Profile.findByIdAndDelete(profile._id);
        await User.findByIdAndDelete(id);
        successResponse(res, 'Admin deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
// Team Management CRUD Operations
export const createTeamMember = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { email, password, role, fullName, department } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User with this email already exists', undefined, 400);
            return;
        }
        // Create user and profile
        const hashedPassword = await hashPassword(password);
        const user = new User({
            email,
            password: hashedPassword
        });
        const profile = new Profile({
            user: user.id,
            fullName,
            role,
            department
        });
        await user.save();
        await profile.save();
        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(email, {
                fullName,
                password,
                role
            }, { role: 'admin' });
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        successResponse(res, 'Team member created successfully', {
            user: {
                email: user.email,
                profile: {
                    fullName: profile.fullName,
                    role: profile.role,
                    department: profile.department
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateTeamMember = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        const { email, role, fullName, department, status } = req.body;
        // Try to find user by User ID first, then by Profile ID
        let user = await User.findById(userId);
        let actualUserId = userId;
        if (!user) {
            // Try finding profile by Profile ID and get the user
            const profile = await Profile.findById(userId);
            if (profile) {
                actualUserId = profile.user.toString();
                user = await User.findById(actualUserId);
            }
        }
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                errorResponse(res, 'Email already in use', undefined, 400);
                return;
            }
            user.email = email;
        }
        if (status) {
            user.status = status;
        }
        await user.save();
        const profile = await Profile.findOneAndUpdate({ user: actualUserId }, { fullName, role, department }, { new: true });
        successResponse(res, 'Team member updated successfully', {
            user: {
                email: user.email,
                status: user.status,
                profile: {
                    fullName: profile?.fullName,
                    role: profile?.role,
                    department: profile?.department
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteTeamMember = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        // Try to find user by User ID first, then by Profile ID
        let user = await User.findById(userId);
        let actualUserId = userId;
        if (!user) {
            // Try finding profile by Profile ID and get the user
            const profile = await Profile.findById(userId);
            if (profile) {
                actualUserId = profile.user.toString();
                user = await User.findById(actualUserId);
            }
        }
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Remove user from all projects
        await ProjectMember.deleteMany({ user: actualUserId });
        // Remove user's tasks
        await Task.updateMany({ assignedTo: actualUserId }, { $set: { assignedTo: null } });
        // Delete profile
        await Profile.findOneAndDelete({ user: actualUserId });
        // Delete user
        await User.findByIdAndDelete(actualUserId);
        successResponse(res, 'Team member deleted successfully', null);
    }
    catch (error) {
        next(error);
    }
};
export const getTeamMember = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        // Try to find user by User ID first, then by Profile ID
        let user = await User.findById(userId)
            .select('-password')
            .populate('profile');
        let actualUserId = userId;
        if (!user) {
            // Try finding profile by Profile ID and get the user
            const profile = await Profile.findById(userId).populate('user');
            if (profile) {
                actualUserId = profile.user.toString();
                user = await User.findById(actualUserId)
                    .select('-password')
                    .populate('profile');
            }
        }
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Get user's projects
        const projectMembers = await ProjectMember.find({ user: actualUserId })
            .populate({
            path: 'project',
            select: 'name status startDate endDate'
        });
        // Get user's tasks
        const tasks = await Task.find({ assignedTo: actualUserId })
            .populate('project', 'name');
        successResponse(res, 'Team member details retrieved successfully', {
            user,
            projects: projectMembers.map(pm => pm.project),
            tasks
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAllTeamMembers = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { role, department, status, page = 1, limit = 10 } = req.query;
        const query = {};
        if (role) {
            query['profile.role'] = role;
        }
        if (department) {
            query['profile.department'] = department;
        }
        if (status) {
            query.status = status;
        }
        const users = await User.find(query)
            .select('-password')
            .populate('profile')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User.countDocuments(query);
        successResponse(res, 'Team members retrieved successfully', {
            users,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
// Admin Privileges Management
export const updateAdminPrivileges = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        const { permissions } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            errorResponse(res, 'User profile not found', undefined, 404);
            return;
        }
        // Update admin permissions
        profile.permissions = permissions;
        await profile.save();
        successResponse(res, 'Admin privileges updated successfully', {
            email: user.email,
            profile: {
                fullName: profile.fullName,
                role: profile.role,
                permissions: profile.permissions
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminPrivileges = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select('-password')
            .populate('profile');
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        if (!user.profile || user.profile.role !== 'admin') {
            errorResponse(res, 'User is not an admin', undefined, 400);
            return;
        }
        successResponse(res, 'Admin privileges retrieved successfully', {
            email: user.email,
            profile: {
                fullName: user.profile.fullName,
                role: user.profile.role,
                permissions: user.profile.permissions
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAllAdmins = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { page = 1, limit = 10 } = req.query;
        const admins = await User.find()
            .select('-password')
            .populate({
            path: 'profile',
            match: { role: 'admin' }
        })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        // Filter out users who don't have an admin profile
        const adminUsers = admins.filter(user => user.profile);
        const total = await User.countDocuments({
            'profile.role': 'admin'
        });
        successResponse(res, 'Admin users retrieved successfully', {
            admins: adminUsers,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
// Admin Activity Logging
export const getAdminActivityLogs = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { startDate, endDate, adminId, action, page = 1, limit = 10 } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (adminId) {
            query.adminId = adminId;
        }
        if (action) {
            query.action = action;
        }
        // Assuming you have an ActivityLog model
        const logs = await mongoose.model('ActivityLog').find(query)
            .populate({
            path: 'adminId',
            select: 'email profile',
            populate: {
                path: 'profile',
                select: 'fullName'
            }
        })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await mongoose.model('ActivityLog').countDocuments(query);
        successResponse(res, 'Admin activity logs retrieved successfully', {
            logs,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateProjectStatus = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { projectId } = req.params;
        const { status } = req.body;
        // Validate status
        const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            errorResponse(res, 'Invalid project status', undefined, 400);
            return;
        }
        const project = await Project.findByIdAndUpdate(projectId, {
            status,
            updatedBy: req.user.id
        }, { new: true }).populate('createdBy', 'email profile');
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        // Log activity
        await new ActivityLog({
            adminId: req.user.id,
            action: 'UPDATE_PROJECT_STATUS',
            details: {
                projectId,
                oldStatus: project.status,
                newStatus: status
            }
        }).save();
        successResponse(res, 'Project status updated successfully', project);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=adminController.js.map