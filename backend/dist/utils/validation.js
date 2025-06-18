import { z } from 'zod';
export const createUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required').trim()
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});
export const createProjectSchema = z.object({
    title: z.string().min(1, 'Project title is required').trim(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});
export const updateProjectSchema = z.object({
    title: z.string().min(1, 'Project title is required').trim().optional(),
    description: z.string().optional(),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').trim(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    projectId: z.string().min(1, 'Project ID is required')
});
export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').trim().optional(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional()
});
export const addProjectMemberSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    roleInProject: z.string().default('member')
});
// Client validation schemas
const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional()
}).optional();
const contactPersonSchema = z.object({
    name: z.string().min(2, 'Contact person name must be at least 2 characters'),
    title: z.string().optional(),
    email: z.string().email('Invalid contact email format'),
    phone: z.string().optional()
});
const billingInfoSchema = z.object({
    billingEmail: z.string().email('Invalid billing email format').optional(),
    billingAddress: addressSchema,
    paymentTerms: z.enum(['net-15', 'net-30', 'net-60', 'immediate']).optional()
}).optional();
export const createClientSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
    companyName: z.string().min(2, 'Company name must be at least 2 characters').trim(),
    industry: z.string().optional(),
    website: z.string().url('Invalid website URL').optional(),
    phone: z.string().optional(),
    address: addressSchema,
    contactPerson: contactPersonSchema,
    billingInfo: billingInfoSchema,
    notes: z.string().optional()
});
export const updateClientSchema = z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').trim().optional(),
    industry: z.string().optional(),
    website: z.string().url('Invalid website URL').optional(),
    phone: z.string().optional(),
    address: addressSchema,
    contactPerson: contactPersonSchema.optional(),
    status: z.enum(['active', 'inactive', 'pending']).optional(),
    billingInfo: billingInfoSchema,
    notes: z.string().optional()
});
//# sourceMappingURL=validation.js.map