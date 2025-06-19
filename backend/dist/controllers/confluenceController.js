import { successResponse, errorResponse } from '../utils/response.js';
import { ConfluencePage } from '../models/ConfluencePage.js';
export const createConfluencePage = async (req, res) => {
    try {
        const { title, content, type, projectId, assignedTo, tags, isPublic, viewPermissions, editPermissions, parentPageId } = req.body;
        const page = new ConfluencePage({
            title,
            content,
            type,
            project: projectId || undefined,
            createdBy: req.user.id,
            lastModifiedBy: req.user.id,
            assignedTo: assignedTo || undefined,
            tags,
            isPublic,
            viewPermissions,
            editPermissions,
            parentPage: parentPageId || undefined
        });
        await page.save();
        await page.populate(['createdBy', 'lastModifiedBy', 'assignedTo', 'project', 'parentPage']);
        successResponse(res, 'Confluence page created successfully.', page, 201);
    }
    catch (error) {
        console.error('Error creating confluence page:', error);
        errorResponse(res, 'Failed to create confluence page.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getConfluencePages = async (req, res) => {
    try {
        const { type, projectId, status, tags, assignedToMe } = req.query;
        const userRole = req.user.role;
        const filter = {};
        if (type)
            filter.type = type;
        if (projectId)
            filter.project = projectId;
        if (status)
            filter.status = status;
        if (tags)
            filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        if (assignedToMe === 'true')
            filter.assignedTo = req.user.id;
        let permissionFilter;
        if (userRole === 'admin') {
            permissionFilter = {};
        }
        else {
            permissionFilter = {
                $or: [
                    { isPublic: true },
                    { viewPermissions: { $in: [userRole] } },
                    { createdBy: req.user.id },
                    { assignedTo: req.user.id }
                ]
            };
        }
        const pages = await ConfluencePage.find({ ...filter, ...permissionFilter })
            .populate('createdBy', 'email profile')
            .populate('lastModifiedBy', 'email profile')
            .populate('assignedTo', 'email profile')
            .populate('project', 'title')
            .populate('parentPage', 'title')
            .sort({ updatedAt: -1 });
        successResponse(res, 'Confluence pages retrieved successfully.', pages);
    }
    catch (error) {
        console.error('Error retrieving confluence pages:', error);
        errorResponse(res, 'Failed to retrieve confluence pages.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getConfluencePage = async (req, res) => {
    try {
        const { pageId } = req.params;
        const userRole = req.user.role;
        const page = await ConfluencePage.findById(pageId)
            .populate('createdBy', 'email profile')
            .populate('lastModifiedBy', 'email profile')
            .populate('assignedTo', 'email profile')
            .populate('project', 'title description')
            .populate('parentPage', 'title');
        if (!page) {
            errorResponse(res, 'Confluence page not found.', undefined, 404);
            return;
        }
        const assignedToId = page.assignedTo ?
            (typeof page.assignedTo === 'object' && page.assignedTo._id ?
                page.assignedTo._id.toString() :
                page.assignedTo.toString()) : null;
        const createdById = page.createdBy ?
            (typeof page.createdBy === 'object' && page.createdBy._id ?
                page.createdBy._id.toString() :
                page.createdBy.toString()) : null;
        const hasViewPermission = page.isPublic ||
            page.viewPermissions.includes(userRole) ||
            createdById === req.user.id ||
            assignedToId === req.user.id ||
            userRole === 'admin';
        if (!hasViewPermission) {
            errorResponse(res, 'Access denied. You do not have permission to view this page.', undefined, 403);
            return;
        }
        successResponse(res, 'Confluence page retrieved successfully.', page);
    }
    catch (error) {
        console.error('Error retrieving confluence page:', error);
        errorResponse(res, 'Failed to retrieve confluence page.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const updateConfluencePage = async (req, res) => {
    try {
        const { pageId } = req.params;
        const updateData = req.body;
        const userRole = req.user.role;
        const page = await ConfluencePage.findById(pageId);
        if (!page) {
            errorResponse(res, 'Confluence page not found.', undefined, 404);
            return;
        }
        const hasEditPermission = page.editPermissions.includes(userRole) ||
            page.createdBy.toString() === req.user.id ||
            userRole === 'admin';
        if (!hasEditPermission) {
            errorResponse(res, 'Access denied. You do not have permission to edit this page.', undefined, 403);
            return;
        }
        const finalUpdateData = {
            ...updateData,
            lastModifiedBy: req.user.id,
            version: page.version + 1
        };
        const updatedPage = await ConfluencePage.findByIdAndUpdate(pageId, finalUpdateData, { new: true, runValidators: true }).populate(['createdBy', 'lastModifiedBy', 'assignedTo', 'project', 'parentPage']);
        successResponse(res, 'Confluence page updated successfully.', updatedPage);
    }
    catch (error) {
        console.error('Error updating confluence page:', error);
        errorResponse(res, 'Failed to update confluence page.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const deleteConfluencePage = async (req, res) => {
    try {
        const { pageId } = req.params;
        const userRole = req.user.role;
        const page = await ConfluencePage.findById(pageId);
        if (!page) {
            errorResponse(res, 'Confluence page not found.', undefined, 404);
            return;
        }
        if (userRole !== 'admin' && page.createdBy.toString() !== req.user.id) {
            errorResponse(res, 'Access denied. You can only delete pages you created.', undefined, 403);
            return;
        }
        await ConfluencePage.findByIdAndDelete(pageId);
        successResponse(res, 'Confluence page deleted successfully.');
    }
    catch (error) {
        console.error('Error deleting confluence page:', error);
        errorResponse(res, 'Failed to delete confluence page.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getPageVersions = async (req, res) => {
    try {
        const { pageId } = req.params;
        const page = await ConfluencePage.findById(pageId)
            .populate('createdBy', 'email profile')
            .populate('lastModifiedBy', 'email profile');
        if (!page) {
            errorResponse(res, 'Confluence page not found.', undefined, 404);
            return;
        }
        const versions = [{
                version: page.version,
                lastModifiedBy: page.lastModifiedBy,
                updatedAt: page.updatedAt,
                title: page.title
            }];
        successResponse(res, 'Page versions retrieved successfully.', versions);
    }
    catch (error) {
        console.error('Error retrieving page versions:', error);
        errorResponse(res, 'Failed to retrieve page versions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
