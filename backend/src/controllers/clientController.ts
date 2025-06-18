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
    // Only admins and project managers can create client accounts
    if (!req.user || !['admin', 'project_manager'].includes(req.user.role)) {
      errorResponse(res, 'Access denied. Only administrators and project managers can create client accounts.', undefined, 403);
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

    // Populate the client data
    await client.populate(['user']);

    successResponse(res, 'Client account created successfully', { 
      client,
      profile,
      message: 'Client account created and pending approval'
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
    // Only admins and project managers can view all clients
    if (!req.user || !['admin', 'project_manager'].includes(req.user.role)) {
      errorResponse(res, 'Access denied. Only administrators and project managers can view clients.', undefined, 403);
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
