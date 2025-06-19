export const extractId = (obj) => {
    if (!obj)
        return null;
    if (typeof obj === 'string') {
        return obj;
    }
    if (obj._id) {
        return obj._id.toString();
    }
    if (obj.id) {
        return obj.id.toString();
    }
    if (obj.toString) {
        return obj.toString();
    }
    return null;
};
export const compareIds = (id1, id2) => {
    const extractedId1 = extractId(id1);
    const extractedId2 = extractId(id2);
    if (!extractedId1 || !extractedId2) {
        return false;
    }
    return extractedId1 === extractedId2;
};
export const findUserByIdOrProfileId = async (id, User, Profile) => {
    let user = await User.findById(id).populate('profile');
    let actualUserId = id;
    if (!user) {
        const profile = await Profile.findById(id).populate('user');
        if (profile) {
            actualUserId = extractId(profile.user) || '';
            user = await User.findById(actualUserId).populate('profile');
        }
    }
    return { user, actualUserId };
};
export const findProfileByIdOrUserId = async (id, Profile) => {
    let profile = await Profile.findOne({ user: id }).populate('user');
    if (!profile) {
        profile = await Profile.findById(id).populate('user');
    }
    return profile;
};
