import { emailService } from './emailService.js';

console.log('Testing emailService import...');
console.log('EmailService type:', typeof emailService);
console.log('EmailService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(emailService)));
