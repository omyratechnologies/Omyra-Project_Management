import { User, Profile, Client } from '../models/index.js';
import { hashPassword, createAuthResponse } from '../utils/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emailService } from '../services/emailService.js';
import { config } from '../config/environment.js';
export const createClient = async (req, res, next) => {
    try {
        if (!req.user || !['admin', 'accountant'].includes(req.user.role)) {
            errorResponse(res, 'Access denied. Only administrators and accountants can create client accounts.', undefined, 403);
            return;
        }
        const { email, password, fullName, companyName, industry, website, phone, address, contactPerson, billingInfo, notes } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User already exists with this email', undefined, 400);
            return;
        }
        const existingClient = await Client.findOne({ 'contactPerson.email': contactPerson.email });
        if (existingClient) {
            errorResponse(res, 'Client already exists with this contact email', undefined, 400);
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
            role: 'client'
        });
        const client = new Client({
            user: user.id,
            companyName,
            industry,
            website,
            phone,
            address,
            contactPerson,
            billingInfo,
            notes,
            status: 'active'
        });
        await user.save();
        await profile.save();
        await client.save();
        user.profile = profile.id;
        await user.save();
        emailService.sendWelcomeEmail(email, { fullName, role: 'client' }).catch((error) => {
            console.error('Failed to send welcome email:', error);
        });
        await client.populate(['user']);
        successResponse(res, 'Client account created successfully', {
            client,
            profile,
            message: 'Client account created and activated'
        }, 201);
    }
    catch (error) {
        next(error);
    }
};
export const registerClient = async (req, res, next) => {
    try {
        const { email, password, fullName, companyName, industry, website, phone, address, contactPerson, billingInfo, notes } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User already exists with this email', undefined, 400);
            return;
        }
        const existingClient = await Client.findOne({ 'contactPerson.email': contactPerson.email });
        if (existingClient) {
            errorResponse(res, 'Client already exists with this contact email', undefined, 400);
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
            role: 'client'
        });
        const client = new Client({
            user: user.id,
            companyName,
            industry,
            website,
            phone,
            address,
            contactPerson,
            billingInfo,
            notes,
            status: 'pending'
        });
        await user.save();
        await profile.save();
        await client.save();
        user.profile = profile.id;
        await user.save();
        emailService.sendWelcomeEmail(email, { fullName, role: 'client' }).catch((error) => {
            console.error('Failed to send welcome email:', error);
        });
        const authResponse = createAuthResponse(user, profile);
        successResponse(res, 'Client registered successfully', {
            ...authResponse,
            client,
            message: 'Registration successful. Your account is pending approval.'
        }, 201);
    }
    catch (error) {
        next(error);
    }
};
export const getClients = async (req, res, next) => {
    try {
        if (!req.user || !['admin', 'accountant'].includes(req.user.role)) {
            errorResponse(res, 'Access denied. Only administrators and accountants can view clients.', undefined, 403);
            return;
        }
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const clients = await Client.find(filter)
            .populate(['user', 'projects'])
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Client.countDocuments(filter);
        successResponse(res, 'Clients retrieved successfully', {
            clients,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const getClient = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (req.user?.role === 'client') {
            const client = await Client.findOne({ user: req.user.id })
                .populate(['user', 'projects']);
            if (!client || client.id?.toString() !== clientId) {
                errorResponse(res, 'Access denied. You can only view your own client profile.', undefined, 403);
                return;
            }
            successResponse(res, 'Client profile retrieved successfully', client);
            return;
        }
        if (!['admin', 'project_manager'].includes(req.user?.role || '')) {
            errorResponse(res, 'Access denied.', undefined, 403);
            return;
        }
        const client = await Client.findById(clientId)
            .populate(['user', 'projects']);
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        successResponse(res, 'Client retrieved successfully', client);
    }
    catch (error) {
        next(error);
    }
};
export const updateClient = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const updateData = req.body;
        if (req.user?.role === 'client') {
            const client = await Client.findOne({ user: req.user.id });
            if (!client || client.id?.toString() !== clientId) {
                errorResponse(res, 'Access denied. You can only update your own client profile.', undefined, 403);
                return;
            }
            delete updateData.status;
        }
        else if (!['admin', 'project_manager'].includes(req.user?.role || '')) {
            errorResponse(res, 'Access denied.', undefined, 403);
            return;
        }
        const client = await Client.findByIdAndUpdate(clientId, updateData, { new: true, runValidators: true }).populate(['user', 'projects']);
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        successResponse(res, 'Client updated successfully', client);
    }
    catch (error) {
        next(error);
    }
};
export const approveClient = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can approve clients.', undefined, 403);
            return;
        }
        const { clientId } = req.params;
        const client = await Client.findByIdAndUpdate(clientId, { status: 'active' }, { new: true }).populate(['user']);
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        if (client.user && 'email' in client.user) {
            const emailMessage = {
                from: config.emailFrom,
                to: client.user.email,
                subject: 'Account Approved',
                text: `Your client account for ${client.companyName} has been approved. You can now access all features.`,
                html: `<p>Your client account for <strong>${client.companyName}</strong> has been approved. You can now access all features.</p>`
            };
            emailService.sendEmail(emailMessage).catch((error) => {
                console.error('Failed to send approval email:', error);
            });
        }
        successResponse(res, 'Client approved successfully', client);
    }
    catch (error) {
        next(error);
    }
};
export const deactivateClient = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can deactivate clients.', undefined, 403);
            return;
        }
        const { clientId } = req.params;
        const client = await Client.findByIdAndUpdate(clientId, { status: 'inactive' }, { new: true }).populate(['user']);
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        successResponse(res, 'Client deactivated successfully', client);
    }
    catch (error) {
        next(error);
    }
};
export const deleteClient = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can delete clients.', undefined, 403);
            return;
        }
        const { clientId } = req.params;
        const client = await Client.findById(clientId).populate('user');
        if (!client) {
            errorResponse(res, 'Client not found', undefined, 404);
            return;
        }
        await Client.findByIdAndDelete(clientId);
        await Profile.findOneAndDelete({ user: client.user });
        await User.findByIdAndDelete(client.user);
        successResponse(res, 'Client deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
export const getMyClientProfile = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'client') {
            errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
            return;
        }
        const client = await Client.findOne({ user: req.user.id })
            .populate(['user', 'projects']);
        if (!client) {
            errorResponse(res, 'Client profile not found', undefined, 404);
            return;
        }
        successResponse(res, 'Client profile retrieved successfully', client);
    }
    catch (error) {
        next(error);
    }
};
export const getClientDashboardStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'client') {
            errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
            return;
        }
        const userId = req.user.id;
        const { Project, Task, Meeting, ClientFeedback, Client, ProjectMember } = await import('../models/index.js');
        const clientDoc = await Client.findOne({ user: userId });
        const clientId = clientDoc?._id;
        const memberProjects = await ProjectMember.find({ user: userId }).distinct('project');
        const projects = await Project.find({
            $or: [
                { client: clientId },
                { _id: { $in: memberProjects } }
            ]
        }).populate('members');
        const projectIds = projects.map(p => p._id);
        const tasks = await Task.find({ project: { $in: projectIds } });
        const meetings = await Meeting.find({ project: { $in: projectIds } });
        const feedback = await ClientFeedback.find({ client: clientId });
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const feedbackSubmitted = feedback.length;
        const activeFeedbackCount = feedback.filter(f => f.status === 'open').length;
        const meetingsAttended = meetings.length;
        const onTrackProjects = projects.filter(p => {
            if (p.status === 'completed')
                return true;
            if (p.endDate && new Date(p.endDate) < new Date())
                return false;
            return true;
        }).length;
        const overallHealth = totalProjects > 0 ? Math.round((onTrackProjects / totalProjects) * 100) : 100;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentActivity = [
            ...tasks.filter(t => t.updatedAt && new Date(t.updatedAt) > thirtyDaysAgo).map(t => ({
                id: t._id.toString(),
                type: 'task',
                title: `Task: ${t.title}`,
                description: `Status changed to ${t.status}`,
                date: t.updatedAt.toISOString(),
                status: t.status
            })),
            ...feedback.filter(f => f.updatedAt && new Date(f.updatedAt) > thirtyDaysAgo).map(f => ({
                id: f._id.toString(),
                type: 'feedback',
                title: `Feedback: ${f.title}`,
                description: f.description,
                date: f.updatedAt.toISOString(),
                status: f.status
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
        const stats = {
            totalProjects,
            activeProjects,
            completedProjects,
            onHoldProjects,
            feedbackSubmitted,
            activeFeedbackCount,
            meetingsAttended,
            overallHealth,
            onTrackProjects,
            completedMilestones: completedTasks,
            avgResponseTime: '2-3 hours',
            recentActivity
        };
        successResponse(res, 'Client dashboard stats retrieved successfully', stats);
    }
    catch (error) {
        next(error);
    }
};
export const getClientProjects = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'client') {
            errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
            return;
        }
        const userId = req.user.id;
        const { Project, Task, Client, ProjectMember } = await import('../models/index.js');
        const clientDoc = await Client.findOne({ user: userId });
        const clientId = clientDoc?._id;
        const memberProjects = await ProjectMember.find({ user: userId }).distinct('project');
        const projects = await Project.find({
            $or: [
                { client: clientId },
                { _id: { $in: memberProjects } }
            ]
        })
            .populate('createdBy', 'profile')
            .populate('members')
            .populate('client', 'contactPerson companyName')
            .sort({ updatedAt: -1 });
        const projectsWithProgress = await Promise.all(projects.map(async (project) => {
            const tasks = await Task.find({ project: project._id });
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            let health = 100;
            if (project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed') {
                health = 30;
            }
            else if (progress < 50 && project.status === 'active') {
                health = 60;
            }
            return {
                ...project.toObject(),
                progress,
                health,
                manager: project.createdBy,
                milestones: [],
                members: project.members || []
            };
        }));
        successResponse(res, 'Client projects retrieved successfully', projectsWithProgress);
    }
    catch (error) {
        next(error);
    }
};
export const getClientRecentActivity = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'client') {
            errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
            return;
        }
        const userId = req.user.id;
        const { Project, Task, Meeting, ClientFeedback, Client, ProjectMember } = await import('../models/index.js');
        const clientDoc = await Client.findOne({ user: userId });
        const clientId = clientDoc?._id;
        const memberProjects = await ProjectMember.find({ user: userId }).distinct('project');
        const projects = await Project.find({
            $or: [
                { client: clientId },
                { _id: { $in: memberProjects } }
            ]
        });
        const projectIds = projects.map(p => p._id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTasks = await Task.find({
            project: { $in: projectIds },
            updatedAt: { $gte: thirtyDaysAgo }
        }).populate('project', 'title').sort({ updatedAt: -1 }).limit(20);
        const recentFeedback = await ClientFeedback.find({
            client: clientId,
            updatedAt: { $gte: thirtyDaysAgo }
        }).populate('project', 'title').sort({ updatedAt: -1 }).limit(10);
        const recentMeetings = await Meeting.find({
            project: { $in: projectIds },
            updatedAt: { $gte: thirtyDaysAgo }
        }).populate('project', 'title').sort({ updatedAt: -1 }).limit(10);
        const activities = [
            ...recentTasks.map(task => ({
                id: task._id.toString(),
                type: 'task',
                title: `Task Updated: ${task.title}`,
                description: `Status changed to ${task.status} in ${task.project?.title || 'Unknown Project'}`,
                date: task.updatedAt?.toISOString() || new Date().toISOString(),
                status: task.status,
                project: task.project?.title || 'Unknown Project'
            })),
            ...recentFeedback.map(feedback => ({
                id: feedback._id.toString(),
                type: 'feedback',
                title: `Feedback: ${feedback.title}`,
                description: feedback.description,
                date: feedback.updatedAt?.toISOString() || new Date().toISOString(),
                status: feedback.status,
                project: feedback.project?.title || 'General'
            })),
            ...recentMeetings.map(meeting => ({
                id: meeting._id.toString(),
                type: 'meeting',
                title: `Meeting: ${meeting.title}`,
                description: `Scheduled for ${new Date(meeting.scheduledAt).toLocaleDateString()}`,
                date: meeting.updatedAt?.toISOString() || new Date().toISOString(),
                status: meeting.status,
                project: meeting.project?.title || 'General'
            }))
        ];
        const sortedActivities = activities
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 20);
        successResponse(res, 'Client recent activity retrieved successfully', sortedActivities);
    }
    catch (error) {
        next(error);
    }
};
export const getClientFeedback = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'client') {
            errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
            return;
        }
        const clientId = req.user.id;
        const { ClientFeedback } = await import('../models/index.js');
        const feedback = await ClientFeedback.find({ client: clientId })
            .populate('project', 'title')
            .sort({ updatedAt: -1 });
        const formattedFeedback = feedback.map(f => ({
            _id: f._id,
            title: f.title,
            message: f.description,
            priority: f.priority,
            status: f.status,
            project: {
                _id: f.project?._id || null,
                title: f.project?.title || 'General'
            },
            response: f.response,
            responseDate: f.respondedAt,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt
        }));
        successResponse(res, 'Client feedback retrieved successfully', formattedFeedback);
    }
    catch (error) {
        next(error);
    }
};
