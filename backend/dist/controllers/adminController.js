import { User, Profile, Project, ProjectMember, Task, Client, ActivityLog } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emailService } from '../services/emailService.js';
import mongoose from 'mongoose';
export const getDashboardStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
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
export const getAllUsers = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { page = 1, limit = 20, role, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User already exists with this email', undefined, 400);
            return;
        }
        const hashedPassword = await hashPassword(password);
        const user = new User({
            email,
            password: hashedPassword
        });
        const profile = new Profile({
            user: user.id,
            fullName,
            email,
            role
        });
        await user.save();
        await profile.save();
        user.profile = profile.id;
        await user.save();
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
        let profile = await Profile.findOne({ user: userId });
        let actualUserId = userId;
        if (!profile) {
            profile = await Profile.findById(userId);
            if (profile) {
                actualUserId = profile.user.toString();
            }
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        if (fullName)
            profile.fullName = fullName;
        if (role)
            profile.role = role;
        await profile.save();
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
        let profile = await Profile.findOne({ user: userId });
        let actualUserId = userId;
        if (!profile) {
            profile = await Profile.findById(userId);
            if (profile) {
                actualUserId = profile.user.toString();
            }
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        if (actualUserId === req.user.id) {
            errorResponse(res, 'Cannot delete your own account', undefined, 400);
            return;
        }
        await ProjectMember.deleteMany({ user: actualUserId });
        await Task.updateMany({ assignedTo: actualUserId }, { $unset: { assignedTo: 1 } });
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
        let profile = await Profile.findOne({ user: userId }).populate('user');
        let actualUserId = userId;
        if (!profile) {
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
        emailService.sendPasswordResetEmail(profile.user.email, profile.fullName, 'admin-reset').catch((error) => {
            console.error('Failed to send password reset confirmation:', error);
        });
        successResponse(res, 'Password reset successfully');
    }
    catch (error) {
        next(error);
    }
};
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
        if (updates.teamMembers && Array.isArray(updates.teamMembers)) {
            await ProjectMember.deleteMany({ project: projectId });
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
        await ProjectMember.deleteMany({ project: projectId });
        await Task.deleteMany({ project: projectId });
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
        let profile = await Profile.findOne({ user: userId }).populate('user', 'email');
        if (!profile) {
            profile = await Profile.findById(userId).populate('user', 'email');
        }
        if (!profile) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        profile.role = role;
        await profile.save();
        successResponse(res, 'User role updated successfully', profile);
    }
    catch (error) {
        next(error);
    }
};
export const getAllClientsAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
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
        if (!client.projects?.includes(new mongoose.Types.ObjectId(projectId))) {
            client.projects = client.projects || [];
            client.projects.push(new mongoose.Types.ObjectId(projectId));
            await client.save();
        }
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
        client.projects = client.projects?.filter(p => p.toString() !== projectId) || [];
        await client.save();
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
export const createAdmin = async (req, res, next) => {
    try {
        const { email, password, fullName, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User with this email already exists', undefined, 400);
            return;
        }
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            email,
            password: hashedPassword
        });
        const profile = await Profile.create({
            user: user._id,
            fullName,
            role: 'admin'
        });
        user.profile = profile._id;
        await user.save();
        await emailService.sendWelcomeEmail(email, fullName, password);
        successResponse(res, 'Admin created successfully', { user, profile });
    }
    catch (error) {
        next(error);
    }
};
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
        if (fullName) {
            profile.fullName = fullName;
            await profile.save();
        }
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
        const adminCount = await Profile.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            errorResponse(res, 'Cannot delete the last admin', undefined, 400);
            return;
        }
        await Profile.findByIdAndDelete(profile._id);
        await User.findByIdAndDelete(id);
        successResponse(res, 'Admin deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
export const createTeamMember = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Admin access required.', undefined, 403);
            return;
        }
        const { email, password, role, fullName, department } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User with this email already exists', undefined, 400);
            return;
        }
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
        let user = await User.findById(userId);
        let actualUserId = userId;
        if (!user) {
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
        let user = await User.findById(userId);
        let actualUserId = userId;
        if (!user) {
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
        await ProjectMember.deleteMany({ user: actualUserId });
        await Task.updateMany({ assignedTo: actualUserId }, { $set: { assignedTo: null } });
        await Profile.findOneAndDelete({ user: actualUserId });
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
        let user = await User.findById(userId)
            .select('-password')
            .populate('profile');
        let actualUserId = userId;
        if (!user) {
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
        const projectMembers = await ProjectMember.find({ user: actualUserId })
            .populate({
            path: 'project',
            select: 'name status startDate endDate'
        });
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
