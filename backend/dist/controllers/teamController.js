import { Profile, ProjectMember, User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import mongoose from 'mongoose';
export const getTeamMembers = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { projectId } = req.query;
        let profiles;
        if (projectId) {
            // Get team members for a specific project
            const projectMembers = await ProjectMember.find({ project: projectId })
                .populate({
                path: 'user',
                populate: {
                    path: 'profile',
                    select: 'fullName email role avatar'
                }
            });
            profiles = projectMembers.map(pm => ({
                ...pm.user.profile.toObject(),
                email: pm.user.email,
                roleInProject: pm.roleInProject,
                joinedAt: pm.joinedAt
            }));
        }
        else {
            // For admin users - get all team members
            if (req.user.role === 'admin') {
                const profilesData = await Profile.find()
                    .populate('user', 'email')
                    .select('fullName role avatar createdAt')
                    .sort({ createdAt: -1 });
                profiles = profilesData.map(profile => ({
                    ...profile.toObject(),
                    userId: profile.user._id || profile.user.id,
                    email: profile.user.email
                }));
            }
            else {
                // For non-admin users - get only team members from their projects
                const userProjects = await ProjectMember.find({ user: req.user.id }).select('project');
                const userProjectIds = userProjects.map(pm => pm.project);
                if (userProjectIds.length === 0) {
                    profiles = [];
                }
                else {
                    // Get all project members from user's projects
                    const projectMembers = await ProjectMember.find({
                        project: { $in: userProjectIds }
                    })
                        .populate({
                        path: 'user',
                        populate: {
                            path: 'profile',
                            select: 'fullName email role avatar createdAt'
                        }
                    });
                    // Remove duplicates and format response
                    const uniqueProfiles = new Map();
                    projectMembers.forEach(pm => {
                        const userId = pm.user._id.toString();
                        if (!uniqueProfiles.has(userId)) {
                            uniqueProfiles.set(userId, {
                                ...pm.user.profile.toObject(),
                                userId: pm.user._id,
                                email: pm.user.email
                            });
                        }
                    });
                    profiles = Array.from(uniqueProfiles.values());
                }
            }
        }
        successResponse(res, 'Team members retrieved successfully', profiles);
    }
    catch (error) {
        next(error);
    }
};
export const getTeamMember = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { id } = req.params;
        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            errorResponse(res, 'Invalid team member ID format', undefined, 400);
            return;
        }
        console.log('Looking up team member with ID:', id);
        // First try to find by Profile ID with expanded user data
        let profile = await Profile.findById(id)
            .populate({
            path: 'user',
            select: 'email status createdAt'
        });
        console.log('Profile lookup result:', profile ? 'found' : 'not found');
        // If not found by Profile ID, try to find by User ID
        if (!profile) {
            console.log('Profile not found, trying User ID lookup');
            const user = await User.findById(id);
            console.log('User lookup result:', user ? 'found' : 'not found');
            if (user) {
                profile = await Profile.findOne({ user: user.id })
                    .populate({
                    path: 'user',
                    select: 'email status createdAt'
                });
                console.log('Profile by User ID lookup result:', profile ? 'found' : 'not found');
            }
        }
        if (!profile) {
            console.log('No profile found by either Profile ID or User ID');
            errorResponse(res, 'Team member not found', undefined, 404);
            return;
        }
        const targetUserId = profile.user.id.toString();
        // Check permissions based on role and project membership
        if (req.user.role === 'admin') {
            // Admin can view all profiles
        }
        else if (targetUserId === req.user.id) {
            // Users can view their own profile
        }
        else {
            // Non-admin users can only view team members from same projects
            const currentUserProjects = await ProjectMember.find({ user: req.user.id }).select('project');
            const targetUserProjects = await ProjectMember.find({ user: targetUserId }).select('project');
            const currentUserProjectIds = currentUserProjects.map(pm => pm.project.toString());
            const targetUserProjectIds = targetUserProjects.map(pm => pm.project.toString());
            // Check if there's any common project
            const hasCommonProject = currentUserProjectIds.some(projectId => targetUserProjectIds.includes(projectId));
            if (!hasCommonProject) {
                errorResponse(res, 'Access denied. You can only view team members from your projects.', undefined, 403);
                return;
            }
        }
        // Return a more complete profile object
        const enrichedProfile = {
            ...profile.toObject(),
            user: {
                ...profile.user.toObject(),
                id: profile.user.id
            },
            id: profile.id
        };
        successResponse(res, 'Team member retrieved successfully', enrichedProfile);
    }
    catch (error) {
        console.error('Error in getTeamMember:', error);
        next(error);
    }
};
export const updateTeamMember = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { id } = req.params;
        const { fullName, role, avatar } = req.body;
        const profile = await Profile.findById(id);
        if (!profile) {
            errorResponse(res, 'Team member not found', undefined, 404);
            return;
        }
        const targetUserId = profile.user.toString();
        // Check permissions
        const isOwnProfile = targetUserId === req.user.id;
        const canUpdateRole = req.user.role === 'admin';
        const canUpdateProfile = isOwnProfile || req.user.role === 'admin';
        if (!canUpdateProfile) {
            errorResponse(res, 'Access denied. You can only update your own profile.', undefined, 403);
            return;
        }
        // Only admins can update roles
        if (role && !canUpdateRole) {
            errorResponse(res, 'Access denied. Only admins can update user roles.', undefined, 403);
            return;
        }
        // Update allowed fields
        if (fullName)
            profile.fullName = fullName;
        if (avatar !== undefined)
            profile.avatar = avatar;
        if (role && canUpdateRole)
            profile.role = role;
        await profile.save();
        const updatedProfile = await Profile.findById(id)
            .populate('user', 'email createdAt');
        successResponse(res, 'Team member updated successfully', updatedProfile);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTeamMember = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        // Only admins can delete team members
        if (req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only admins can delete team members', undefined, 403);
            return;
        }
        const { id } = req.params;
        const profile = await Profile.findById(id);
        if (!profile) {
            errorResponse(res, 'Team member not found', undefined, 404);
            return;
        }
        // Prevent deleting own account
        if (profile.user.toString() === req.user.id) {
            errorResponse(res, 'Cannot delete your own account', undefined, 400);
            return;
        }
        // Remove from all project memberships
        await ProjectMember.deleteMany({ user: profile.user });
        // Delete profile and user
        await Profile.findByIdAndDelete(id);
        await User.findByIdAndDelete(profile.user);
        successResponse(res, 'Team member deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=teamController.js.map