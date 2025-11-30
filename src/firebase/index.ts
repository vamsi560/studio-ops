'use client';

// Re-export initialization functions
export { initializeFirebase, getSdks } from './init';

// Explicit exports to avoid circular dependency issues with barrel exports
// Import directly from specific files when possible for better tree-shaking

// Provider exports
export { 
  FirebaseProvider, 
  useFirebase, 
  useAuth, 
  useFirestore, 
  useFirebaseApp, 
  useUser,
  useMemoFirebase,
  type FirebaseContextState,
  type FirebaseServicesAndUser,
  type UserHookResult
} from './provider';

// Firestore hooks
export { useCollection, type UseCollectionResult, type WithId } from './firestore/use-collection';
export { useDoc, type UseDocResult } from './firestore/use-doc';

// Non-blocking operations
export { 
  addDocumentNonBlocking, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from './non-blocking-updates';

// Authentication
export { 
  initiateAnonymousSignIn, 
  initiateEmailSignUp, 
  initiateEmailSignIn 
} from './non-blocking-login';

// Errors
export { FirestorePermissionError } from './errors';
export { errorEmitter, type AppEvents } from './error-emitter';

// Note: client-provider is NOT exported here to avoid circular dependencies
// Import it directly: import { FirebaseClientProvider } from '@/firebase/client-provider'
