'use client';

/**
 * DEPRECATED: This barrel export is kept for backward compatibility but should NOT be used.
 * Import directly from specific files to avoid circular dependency issues:
 * 
 * - useFirestore, useAuth, useUser, etc. → '@/firebase/provider'
 * - useCollection, useDoc → '@/firebase/firestore/use-collection' or '@/firebase/firestore/use-doc'
 * - addDocumentNonBlocking → '@/firebase/non-blocking-updates'
 * - initiateAnonymousSignIn → '@/firebase/non-blocking-login'
 * - FirebaseClientProvider → '@/firebase/client-provider'
 * 
 * The barrel export can cause circular dependency issues in production builds.
 */

// Re-export initialization functions (these are safe)
export { initializeFirebase, getSdks } from './init';
