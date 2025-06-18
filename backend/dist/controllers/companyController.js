import { successResponse, errorResponse } from '../utils/response.js';
// Mock company settings - in a real app, this would be in a database
let companySettings = {
    companyName: '',
    companyEmail: '',
    companyWebsite: '',
    companyAddress: '',
};
export const getCompanySettings = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        // Only admins can view company settings
        if (req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can view company settings.', undefined, 403);
            return;
        }
        successResponse(res, 'Company settings retrieved successfully', companySettings);
    }
    catch (error) {
        next(error);
    }
};
export const updateCompanySettings = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        // Only admins can update company settings
        if (req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can update company settings.', undefined, 403);
            return;
        }
        const { companyName, companyEmail, companyWebsite, companyAddress } = req.body;
        // Update company settings
        if (companyName !== undefined)
            companySettings.companyName = companyName;
        if (companyEmail !== undefined)
            companySettings.companyEmail = companyEmail;
        if (companyWebsite !== undefined)
            companySettings.companyWebsite = companyWebsite;
        if (companyAddress !== undefined)
            companySettings.companyAddress = companyAddress;
        successResponse(res, 'Company settings updated successfully', companySettings);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=companyController.js.map