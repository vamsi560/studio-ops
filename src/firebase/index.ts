'use client';

// Re-export initialization functions
export { initializeFirebase, getSdks } from './init';

// Export all other Firebase modules
export * from './provider';
// Note: client-provider is NOT exported here to avoid circular dependencies
// Import it directly: import { FirebaseClientProvider } from '@/firebase/client-provider'
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
