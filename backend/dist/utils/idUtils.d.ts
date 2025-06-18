/**
 * Utility functions for handling MongoDB ObjectId comparisons and conversions
 */
export declare const extractId: (obj: any) => string | null;
export declare const compareIds: (id1: any, id2: any) => boolean;
export declare const findUserByIdOrProfileId: (id: string, User: any, Profile: any) => Promise<{
    user: any;
    actualUserId: string;
}>;
export declare const findProfileByIdOrUserId: (id: string, Profile: any) => Promise<any>;
//# sourceMappingURL=idUtils.d.ts.map