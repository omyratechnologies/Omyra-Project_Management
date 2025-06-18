/**
 * Utility functions for handling MongoDB ObjectId comparisons and conversions
 */

export const extractId = (obj: any): string | null => {
  if (!obj) return null;
  
  // If it's already a string ID
  if (typeof obj === 'string') {
    return obj;
  }
  
  // If it's a populated object with _id
  if (obj._id) {
    return obj._id.toString();
  }
  
  // If it's a populated object with id
  if (obj.id) {
    return obj.id.toString();
  }
  
  // If it's an ObjectId directly
  if (obj.toString) {
    return obj.toString();
  }
  
  return null;
};

export const compareIds = (id1: any, id2: any): boolean => {
  const extractedId1 = extractId(id1);
  const extractedId2 = extractId(id2);
  
  if (!extractedId1 || !extractedId2) {
    return false;
  }
  
  return extractedId1 === extractedId2;
};

export const findUserByIdOrProfileId = async (id: string, User: any, Profile: any) => {
  // Try to find user by User ID first
  let user = await User.findById(id).populate('profile');
  let actualUserId = id;
  
  if (!user) {
    // Try finding profile by Profile ID and get the user
    const profile = await Profile.findById(id).populate('user');
    if (profile) {
      actualUserId = extractId(profile.user) || '';
      user = await User.findById(actualUserId).populate('profile');
    }
  }
  
  return { user, actualUserId };
};

export const findProfileByIdOrUserId = async (id: string, Profile: any) => {
  // Try to find profile by User ID first
  let profile = await Profile.findOne({ user: id }).populate('user');
  
  if (!profile) {
    // Try finding profile by Profile ID
    profile = await Profile.findById(id).populate('user');
  }
  
  return profile;
};
