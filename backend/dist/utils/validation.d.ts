import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
}, {
    email: string;
    password: string;
    fullName: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    title: string;
    description?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["planning", "active", "on_hold", "completed", "cancelled"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "planning" | "on_hold" | "completed" | "cancelled" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    status?: "active" | "planning" | "on_hold" | "completed" | "cancelled" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    assignedTo: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    projectId: string;
    description?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["todo", "in_progress", "review", "done"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    assignedTo: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "todo" | "in_progress" | "review" | "done" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}, {
    status?: "todo" | "in_progress" | "review" | "done" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
}>;
export declare const addProjectMemberSchema: z.ZodObject<{
    userId: z.ZodString;
    roleInProject: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    roleInProject: string;
    userId: string;
}, {
    userId: string;
    roleInProject?: string | undefined;
}>;
export declare const createClientSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    companyName: z.ZodString;
    industry: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    }, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    }>>;
    contactPerson: z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    }, {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    }>;
    billingInfo: z.ZodOptional<z.ZodObject<{
        billingEmail: z.ZodOptional<z.ZodString>;
        billingAddress: z.ZodOptional<z.ZodObject<{
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            zipCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        }, {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        }>>;
        paymentTerms: z.ZodOptional<z.ZodEnum<["net-15", "net-30", "net-60", "immediate"]>>;
    }, "strip", z.ZodTypeAny, {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    }, {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    contactPerson: {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    };
    phone?: string | undefined;
    industry?: string | undefined;
    website?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    } | undefined;
    notes?: string | undefined;
    billingInfo?: {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    } | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    contactPerson: {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    };
    phone?: string | undefined;
    industry?: string | undefined;
    website?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    } | undefined;
    notes?: string | undefined;
    billingInfo?: {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    } | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    }, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    }>>;
    contactPerson: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    }, {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    }>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending"]>>;
    billingInfo: z.ZodOptional<z.ZodObject<{
        billingEmail: z.ZodOptional<z.ZodString>;
        billingAddress: z.ZodOptional<z.ZodObject<{
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            zipCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        }, {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        }>>;
        paymentTerms: z.ZodOptional<z.ZodEnum<["net-15", "net-30", "net-60", "immediate"]>>;
    }, "strip", z.ZodTypeAny, {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    }, {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "pending" | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    industry?: string | undefined;
    website?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    } | undefined;
    contactPerson?: {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    } | undefined;
    notes?: string | undefined;
    billingInfo?: {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    } | undefined;
}, {
    status?: "active" | "inactive" | "pending" | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    industry?: string | undefined;
    website?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        zipCode?: string | undefined;
    } | undefined;
    contactPerson?: {
        email: string;
        name: string;
        phone?: string | undefined;
        title?: string | undefined;
    } | undefined;
    notes?: string | undefined;
    billingInfo?: {
        billingEmail?: string | undefined;
        billingAddress?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            country?: string | undefined;
            zipCode?: string | undefined;
        } | undefined;
        paymentTerms?: "net-15" | "net-30" | "net-60" | "immediate" | undefined;
    } | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map