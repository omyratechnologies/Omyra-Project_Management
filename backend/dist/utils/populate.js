// Utility functions for safe population of user fields
export const safeUserPopulate = {
    path: 'user',
    select: '-password',
    populate: {
        path: 'profile',
        select: 'fullName email role avatar'
    }
};
export const safeCreatedByPopulate = {
    path: 'createdBy',
    select: '-password',
    populate: {
        path: 'profile',
        select: 'fullName email role avatar'
    }
};
export const safeAssignedToPopulate = {
    path: 'assignedTo',
    select: '-password',
    populate: {
        path: 'profile',
        select: 'fullName email role avatar'
    }
};
export const safeMemberPopulate = {
    path: 'members',
    populate: {
        path: 'user',
        select: '-password',
        populate: {
            path: 'profile',
            select: 'fullName email role avatar'
        }
    }
};
//# sourceMappingURL=populate.js.map