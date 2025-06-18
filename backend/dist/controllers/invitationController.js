import { Invitation } from '../models/Invitation.js';
import { User, Profile } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emailService } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';
export const sendTeamInvitation = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        // Check if user has permission to invite
        if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
            errorResponse(res, 'Access denied. Only admins and project managers can invite team members', undefined, 403);
            return;
        }
        const { email, fullName, role, organizationName, projectId } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errorResponse(res, 'User with this email already exists', undefined, 400);
            return;
        }
        // Check if there's already a pending invitation
        const existingInvitation = await Invitation.findOne({
            email,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });
        if (existingInvitation) {
            errorResponse(res, 'Invitation already sent to this email', undefined, 400);
            return;
        }
        // Get inviter profile
        const inviterProfile = await Profile.findOne({ user: req.user.id });
        if (!inviterProfile) {
            errorResponse(res, 'Inviter profile not found', undefined, 404);
            return;
        }
        // Generate invitation token
        const invitationToken = jwt.sign({
            email,
            role,
            inviterId: req.user.id,
            type: 'team_invitation'
        }, config.jwtSecret, { expiresIn: '7d' });
        // Create invitation record
        const invitation = new Invitation({
            email,
            inviteeName: fullName,
            inviterName: inviterProfile.fullName,
            inviterId: req.user.id,
            organizationName: organizationName || 'Omyra Project Nexus',
            role,
            token: invitationToken,
            projectId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        await invitation.save();
        // Send invitation email
        try {
            await emailService.sendTeamInvitationEmail(email, fullName, inviterProfile.fullName, organizationName || 'Omyra Project Nexus', role, invitationToken);
        }
        catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
            // Don't fail the request if email fails, but log it
        }
        successResponse(res, 'Team invitation sent successfully', {
            invitationId: invitation.id,
            email,
            role,
            expiresAt: invitation.expiresAt
        }, 201);
    }
    catch (error) {
        next(error);
    }
};
export const acceptInvitation = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            errorResponse(res, 'Token and password are required', undefined, 400);
            return;
        }
        // Verify and decode token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        }
        catch (jwtError) {
            errorResponse(res, 'Invalid or expired invitation token', undefined, 400);
            return;
        }
        // Find invitation
        const invitation = await Invitation.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });
        if (!invitation) {
            errorResponse(res, 'Invitation not found or expired', undefined, 404);
            return;
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email: invitation.email });
        if (existingUser) {
            errorResponse(res, 'User with this email already exists', undefined, 400);
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        // Create user
        const user = new User({
            email: invitation.email,
            password: hashedPassword
        });
        await user.save();
        // Create profile
        const profile = new Profile({
            user: user.id,
            fullName: invitation.inviteeName,
            role: invitation.role
        });
        await profile.save();
        // Update user with profile reference
        user.profile = profile.id;
        await user.save();
        // Mark invitation as accepted
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date();
        await invitation.save();
        // Generate JWT for the new user
        const authToken = jwt.sign({
            userId: user.id,
            email: user.email,
            role: profile.role
        }, config.jwtSecret, { expiresIn: '7d' });
        successResponse(res, 'Invitation accepted successfully', {
            token: authToken,
            user: {
                id: user.id,
                email: user.email,
                profile: {
                    id: profile.id,
                    fullName: profile.fullName,
                    email: user.email,
                    role: profile.role
                }
            }
        }, 201);
    }
    catch (error) {
        next(error);
    }
};
export const getInvitationDetails = async (req, res, next) => {
    try {
        const { token } = req.params;
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        }
        catch (jwtError) {
            errorResponse(res, 'Invalid or expired invitation token', undefined, 400);
            return;
        }
        // Find invitation
        const invitation = await Invitation.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });
        if (!invitation) {
            errorResponse(res, 'Invitation not found or expired', undefined, 404);
            return;
        }
        successResponse(res, 'Invitation details retrieved successfully', {
            email: invitation.email,
            inviteeName: invitation.inviteeName,
            inviterName: invitation.inviterName,
            organizationName: invitation.organizationName,
            role: invitation.role,
            expiresAt: invitation.expiresAt
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=invitationController.js.map