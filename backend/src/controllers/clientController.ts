import { Response, NextFunction } from 'express';
import { User, Profile, Client } from '../models/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { hashPassword, createAuthResponse } from '../utils/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { CreateClientRequest, UpdateClientRequest } from '../types/index.js';
import { emailService } from '../services/emailService.js';
import { config } from '../config/environment.js';

export const createClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only admins and accountants can create client accounts
    if (!req.user || !['admin', 'accountant'].includes(req.user.role)) {
      errorResponse(res, 'Access denied. Only administrators and accountants can create client accounts.', undefined, 403);
      return;
    }

    const {
      email,
      password,
      fullName,
      companyName,
      industry,
      website,
      phone,
      address,
      contactPerson,
      billingInfo,
      notes
    }: CreateClientRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errorResponse(res, 'User already exists with this email', undefined, 400);
      return;
    }

    // Check if client already exists with same company email
    const existingClient = await Client.findOne({ 'contactPerson.email': contactPerson.email });
    if (existingClient) {
      errorResponse(res, 'Client already exists with this contact email', undefined, 400);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword
    });

    // Create profile with client role
    const profile = new Profile({
      user: user.id,
      fullName,
      email,
      role: 'client'
    });

    // Create client record - active by default when created by admin/accountant
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
      status: 'active' // No approval needed for admin/accountant created clients
    });

    // Save all documents
    await user.save();
    await profile.save();
    await client.save();

    // Update user with profile reference
    user.profile = profile.id as any;
    await user.save();

    // Send welcome email (don't wait for it to complete)
    emailService.sendWelcomeEmail(email, { fullName, role: 'client' }).catch((error: any) => {
      console.error('Failed to send welcome email:', error);
    });

    // Populate the client data
    await client.populate(['user']);

    successResponse(res, 'Client account created successfully', { 
      client,
      profile,
      message: 'Client account created and activated'
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const registerClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      email,
      password,
      fullName,
      companyName,
      industry,
      website,
      phone,
      address,
      contactPerson,
      billingInfo,
      notes
    }: CreateClientRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errorResponse(res, 'User already exists with this email', undefined, 400);
      return;
    }

    // Check if client already exists with same company email
    const existingClient = await Client.findOne({ 'contactPerson.email': contactPerson.email });
    if (existingClient) {
      errorResponse(res, 'Client already exists with this contact email', undefined, 400);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword
    });

    // Create profile with client role
    const profile = new Profile({
      user: user.id,
      fullName,
      email,
      role: 'client'
    });

    // Create client record
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
      status: 'pending' // Default to pending until approved
    });

    // Save all documents
    await user.save();
    await profile.save();
    await client.save();

    // Update user with profile reference
    user.profile = profile.id as any;
    await user.save();

    // Send welcome email (don't wait for it to complete)
    emailService.sendWelcomeEmail(email, { fullName, role: 'client' }).catch((error: any) => {
      console.error('Failed to send welcome email:', error);
    });

    // Create auth response for immediate login
    const authResponse = createAuthResponse(user, profile);

    successResponse(res, 'Client registered successfully', {
      ...authResponse,
      client,
      message: 'Registration successful. Your account is pending approval.'
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const getClients = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only admins and accountants can view all clients
    if (!req.user || !['admin', 'accountant'].includes(req.user.role)) {
      errorResponse(res, 'Access denied. Only administrators and accountants can view clients.', undefined, 403);
      return;
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter: any = {};
    
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
  } catch (error) {
    next(error);
  }
};

export const getClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clientId } = req.params;

    // Clients can only view their own data, others need admin/PM role
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

    // For admins and project managers
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
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clientId } = req.params;
    const updateData: UpdateClientRequest = req.body;

    // Clients can only update their own data, others need admin/PM role
    if (req.user?.role === 'client') {
      const client = await Client.findOne({ user: req.user.id });
      
      if (!client || client.id?.toString() !== clientId) {
        errorResponse(res, 'Access denied. You can only update your own client profile.', undefined, 403);
        return;
      }

      // Clients cannot change their status
      delete updateData.status;
    } else if (!['admin', 'project_manager'].includes(req.user?.role || '')) {
      errorResponse(res, 'Access denied.', undefined, 403);
      return;
    }

    const client = await Client.findByIdAndUpdate(
      clientId,
      updateData,
      { new: true, runValidators: true }
    ).populate(['user', 'projects']);

    if (!client) {
      errorResponse(res, 'Client not found', undefined, 404);
      return;
    }

    successResponse(res, 'Client updated successfully', client);
  } catch (error) {
    next(error);
  }
};

export const approveClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only admins can approve clients
    if (!req.user || req.user.role !== 'admin') {
      errorResponse(res, 'Access denied. Only administrators can approve clients.', undefined, 403);
      return;
    }

    const { clientId } = req.params;

    const client = await Client.findByIdAndUpdate(
      clientId,
      { status: 'active' },
      { new: true }
    ).populate(['user']);

    if (!client) {
      errorResponse(res, 'Client not found', undefined, 404);
      return;
    }

    // Send approval email
    if (client.user && 'email' in client.user) {
      const emailMessage = {
        from: config.emailFrom,
        to: client.user.email as string,
        subject: 'Account Approved',
        text: `Your client account for ${client.companyName} has been approved. You can now access all features.`,
        html: `<p>Your client account for <strong>${client.companyName}</strong> has been approved. You can now access all features.</p>`
      };
      
      emailService.sendEmail(emailMessage).catch((error: any) => {
        console.error('Failed to send approval email:', error);
      });
    }

    successResponse(res, 'Client approved successfully', client);
  } catch (error) {
    next(error);
  }
};

export const deactivateClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only admins can deactivate clients
    if (!req.user || req.user.role !== 'admin') {
      errorResponse(res, 'Access denied. Only administrators can deactivate clients.', undefined, 403);
      return;
    }

    const { clientId } = req.params;

    const client = await Client.findByIdAndUpdate(
      clientId,
      { status: 'inactive' },
      { new: true }
    ).populate(['user']);

    if (!client) {
      errorResponse(res, 'Client not found', undefined, 404);
      return;
    }

    successResponse(res, 'Client deactivated successfully', client);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only admins can delete clients
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

    // Delete client, profile, and user
    await Client.findByIdAndDelete(clientId);
    await Profile.findOneAndDelete({ user: client.user });
    await User.findByIdAndDelete(client.user);

    successResponse(res, 'Client deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyClientProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  } catch (error) {
    next(error);
  }
};

// Client Dashboard Methods
export const getClientDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only clients can access this endpoint
    if (!req.user || req.user.role !== 'client') {
      errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
      return;
    }

    const userId = req.user.id;

    // Import required models
    const { Project, Task, Meeting, ClientFeedback, Client, ProjectMember } = await import('../models/index.js');

    // First, find the Client document for this user
    const clientDoc = await Client.findOne({ user: userId });
    const clientId = clientDoc?._id;

    // Find projects where user is a member
    const memberProjects = await ProjectMember.find({ user: userId }).distinct('project');

    // Get projects where client is assigned or user is a member
    const projects = await Project.find({
      $or: [
        { client: clientId }, // Projects assigned to the client
        { _id: { $in: memberProjects } } // Projects where user is a member
      ]
    }).populate('members');

    const projectIds = projects.map(p => p._id);

    // Get tasks for client's projects
    const tasks = await Task.find({ project: { $in: projectIds } });

    // Get meetings for client's projects
    const meetings = await Meeting.find({ project: { $in: projectIds } });

    // Get client feedback
    const feedback = await ClientFeedback.find({ client: clientId });

    // Calculate stats
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const feedbackSubmitted = feedback.length;
    const activeFeedbackCount = feedback.filter(f => f.status === 'open').length;

    const meetingsAttended = meetings.length; // Simplified - could be more detailed with attendance tracking

    // Calculate project health (simplified)
    const onTrackProjects = projects.filter(p => {
      if (p.status === 'completed') return true;
      if (p.endDate && new Date(p.endDate) < new Date()) return false; // Overdue
      return true; // On track or no deadline
    }).length;

    const overallHealth = totalProjects > 0 ? Math.round((onTrackProjects / totalProjects) * 100) : 100;

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = [
      ...tasks.filter(t => t.updatedAt && new Date(t.updatedAt) > thirtyDaysAgo).map(t => ({
        id: t._id.toString(),
        type: 'task',
        title: `Task: ${t.title}`,
        description: `Status changed to ${t.status}`,
        date: t.updatedAt!.toISOString(),
        status: t.status
      })),
      ...feedback.filter(f => f.updatedAt && new Date(f.updatedAt) > thirtyDaysAgo).map(f => ({
        id: f._id.toString(),
        type: 'feedback',
        title: `Feedback: ${f.title}`,
        description: f.description,
        date: f.updatedAt!.toISOString(),
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
      completedMilestones: completedTasks, // Simplified
      avgResponseTime: '2-3 hours', // Hardcoded for now
      recentActivity
    };

    successResponse(res, 'Client dashboard stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export const getClientProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only clients can access this endpoint
    if (!req.user || req.user.role !== 'client') {
      errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
      return;
    }

    const userId = req.user.id;
    const { Project, Task, Client, ProjectMember } = await import('../models/index.js');

    // First, find the Client document for this user
    const clientDoc = await Client.findOne({ user: userId });
    const clientId = clientDoc?._id;

    // Find projects where user is a member
    const memberProjects = await ProjectMember.find({ user: userId }).distinct('project');

    // Get projects where client is assigned or a member
    const projects = await Project.find({
      $or: [
        { client: clientId }, // Projects assigned to the client
        { _id: { $in: memberProjects } } // Projects where user is a member
      ]
    })
    .populate('createdBy', 'profile')
    .populate('members')
    .populate('client', 'contactPerson companyName')
    .sort({ updatedAt: -1 });

    // Get tasks for each project to calculate progress
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        
        // Calculate health based on progress and timeline
        let health = 100;
        if (project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed') {
          health = 30; // Overdue
        } else if (progress < 50 && project.status === 'active') {
          health = 60; // Behind schedule
        }

        return {
          ...project.toObject(),
          progress,
          health,
          manager: project.createdBy, // Assuming creator is manager
          milestones: [], // Simplified - could be implemented with Task milestones
          members: (project as any).members || []
        };
      })
    );

    successResponse(res, 'Client projects retrieved successfully', projectsWithProgress);
  } catch (error) {
    next(error);
  }
};

export const getClientRecentActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only clients can access this endpoint
    if (!req.user || req.user.role !== 'client') {
      errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
      return;
    }

    const userId = req.user.id;
    const { Project, Task, Meeting, ClientFeedback, Client, ProjectMember } = await import('../models/index.js');

    // First, find the Client document for this user
    const clientDoc = await Client.findOne({ user: userId });
    const clientId = clientDoc?._id;

    // Find projects where user is a member
    const memberProjects = await ProjectMember.find({ user: userId }).distinct('project');

    // Get client's projects
    const projects = await Project.find({
      $or: [
        { client: clientId }, // Projects assigned to the client
        { _id: { $in: memberProjects } } // Projects where user is a member
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get recent activity from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent tasks
    const recentTasks = await Task.find({
      project: { $in: projectIds },
      updatedAt: { $gte: thirtyDaysAgo }
    }).populate('project', 'title').sort({ updatedAt: -1 }).limit(20);

    // Get recent feedback
    const recentFeedback = await ClientFeedback.find({
      client: clientId,
      updatedAt: { $gte: thirtyDaysAgo }
    }).populate('project', 'title').sort({ updatedAt: -1 }).limit(10);

    // Get recent meetings
    const recentMeetings = await Meeting.find({
      project: { $in: projectIds },
      updatedAt: { $gte: thirtyDaysAgo }
    }).populate('project', 'title').sort({ updatedAt: -1 }).limit(10);

    // Combine and format activities
    const activities = [
      ...recentTasks.map(task => ({
        id: task._id.toString(),
        type: 'task',
        title: `Task Updated: ${task.title}`,
        description: `Status changed to ${task.status} in ${(task.project as any)?.title || 'Unknown Project'}`,
        date: task.updatedAt?.toISOString() || new Date().toISOString(),
        status: task.status,
        project: (task.project as any)?.title || 'Unknown Project'
      })),
      ...recentFeedback.map(feedback => ({
        id: feedback._id.toString(),
        type: 'feedback',
        title: `Feedback: ${feedback.title}`,
        description: feedback.description,
        date: feedback.updatedAt?.toISOString() || new Date().toISOString(),
        status: feedback.status,
        project: (feedback.project as any)?.title || 'General'
      })),
      ...recentMeetings.map(meeting => ({
        id: meeting._id.toString(),
        type: 'meeting',
        title: `Meeting: ${meeting.title}`,
        description: `Scheduled for ${new Date(meeting.scheduledAt).toLocaleDateString()}`,
        date: meeting.updatedAt?.toISOString() || new Date().toISOString(),
        status: meeting.status,
        project: (meeting.project as any)?.title || 'General'
      }))
    ];

    // Sort by date and limit to 20 most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    successResponse(res, 'Client recent activity retrieved successfully', sortedActivities);
  } catch (error) {
    next(error);
  }
};

export const getClientFeedback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only clients can access this endpoint
    if (!req.user || req.user.role !== 'client') {
      errorResponse(res, 'Access denied. Only clients can access this endpoint.', undefined, 403);
      return;
    }

    const clientId = req.user.id;
    const { ClientFeedback } = await import('../models/index.js');

    // Get all feedback for this client
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
        _id: (f.project as any)?._id || null,
        title: (f.project as any)?.title || 'General'
      },
      response: f.response,
      responseDate: f.respondedAt,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }));

    successResponse(res, 'Client feedback retrieved successfully', formattedFeedback);
  } catch (error) {
    next(error);
  }
};
