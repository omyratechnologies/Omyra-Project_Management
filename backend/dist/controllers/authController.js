import { User, Profile } from '../models/index.js';
import { hashPassword, comparePassword, createAuthResponse } from '../utils/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emailService } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
export const register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;
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
            role: 'team_member' // Default role
        });
        // Save both documents
        await user.save();
        await profile.save();
        // Update user with profile reference
        user.profile = profile.id;
        await user.save();
        // Send welcome email (don't wait for it to complete)
        emailService.sendWelcomeEmail(email, { fullName, role: 'team_member' }).catch((error) => {
            console.error('Failed to send welcome email:', error);
        });
        // Create auth response
        const authResponse = createAuthResponse(user, profile);
        successResponse(res, 'User registered successfully', authResponse, 201);
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user with profile
        const user = await User.findOne({ email }).populate('profile');
        if (!user) {
            errorResponse(res, 'Invalid email or password', undefined, 400);
            return;
        }
        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            errorResponse(res, 'Invalid email or password', undefined, 400);
            return;
        }
        // Create auth response
        const authResponse = createAuthResponse(user, user.profile);
        successResponse(res, 'Login successful', authResponse);
    }
    catch (error) {
        next(error);
    }
};
export const getProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const user = await User.findById(req.user.id).populate('profile');
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        successResponse(res, 'Profile retrieved successfully', {
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { fullName, phone, location, avatar } = req.body;
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            errorResponse(res, 'Profile not found', undefined, 404);
            return;
        }
        // Update profile fields
        if (fullName)
            profile.fullName = fullName;
        if (phone !== undefined)
            profile.phone = phone;
        if (location !== undefined)
            profile.location = location;
        if (avatar !== undefined)
            profile.avatar = avatar;
        await profile.save();
        successResponse(res, 'Profile updated successfully', profile);
    }
    catch (error) {
        next(error);
    }
};
export const updatePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            errorResponse(res, 'Current password is incorrect', undefined, 400);
            return;
        }
        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();
        successResponse(res, 'Password updated successfully', {});
    }
    catch (error) {
        next(error);
    }
};
export const updatePreferences = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { notifications, appearance } = req.body;
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            errorResponse(res, 'Profile not found', undefined, 404);
            return;
        }
        // Update preferences
        if (notifications) {
            profile.preferences = profile.preferences || {};
            profile.preferences.notifications = { ...profile.preferences.notifications, ...notifications };
        }
        if (appearance) {
            profile.preferences = profile.preferences || {};
            profile.preferences.appearance = { ...profile.preferences.appearance, ...appearance };
        }
        await profile.save();
        successResponse(res, 'Preferences updated successfully', profile.preferences);
    }
    catch (error) {
        next(error);
    }
};
export const getPreferences = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            errorResponse(res, 'Profile not found', undefined, 404);
            return;
        }
        const defaultPreferences = {
            notifications: {
                emailNotifications: true,
                taskAssignments: true,
                projectUpdates: true,
                dueDateReminders: true,
                teamActivity: false,
            },
            appearance: {
                theme: 'light',
                language: 'en',
                timezone: 'est',
            },
        };
        const preferences = {
            notifications: { ...defaultPreferences.notifications, ...profile.preferences?.notifications },
            appearance: { ...defaultPreferences.appearance, ...profile.preferences?.appearance },
        };
        successResponse(res, 'Preferences retrieved successfully', preferences);
    }
    catch (error) {
        next(error);
    }
};
export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        // Find user
        const user = await User.findOne({ email }).populate('profile');
        if (!user) {
            // Don't reveal if email exists or not for security
            successResponse(res, 'If an account with that email exists, a password reset link has been sent');
            return;
        }
        // Generate reset token
        const resetToken = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '1h' });
        // Send password reset email
        const profile = user.profile;
        const userName = profile?.fullName || email.split('@')[0];
        emailService.sendPasswordResetEmail(email, userName, resetToken).catch((error) => {
            console.error('Failed to send password reset email:', error);
        });
        successResponse(res, 'If an account with that email exists, a password reset link has been sent');
    }
    catch (error) {
        next(error);
    }
};
export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        }
        catch (error) {
            errorResponse(res, 'Invalid or expired reset token', undefined, 400);
            return;
        }
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            errorResponse(res, 'User not found', undefined, 404);
            return;
        }
        // Hash new password
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();
        successResponse(res, 'Password reset successfully');
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=authController.js.map