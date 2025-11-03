import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from './rootReducer';

// Security Filter: Remove sensitive data before saving
const securityTransform = createTransform(
  // SAVE: Filter what goes to localStorage
  (stateToSave: any) => (
    { user: stateToSave.user ? {
      _id: stateToSave.user._id,
      id: stateToSave.user.id,
      name: stateToSave.user.name,
      email: stateToSave.user.email,
      role: stateToSave.user.role,
      isVerified: stateToSave.user.isVerified,
      lastLogin: stateToSave.user.lastLogin
    } : null,
    isAuthenticated: stateToSave.isAuthenticated
  }),


  // LOAD: Add defaults when restoring
  (stateToLoad: any) => ({
    ...stateToLoad,
    loading: false,
    error: null
  }),
  
  { whitelist: ['auth'] }
);


//encrypt
const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_PERSIST_KEY || 'helloworld',
  onError: (error:any) => {
    console.error('Encryption error:', error);
  },
});



// Persist Config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'admin'], // Added 'admin' to persist search state
  transforms: [securityTransform, encryptor],
};

// Wrap reducer with persist
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/*
QUICK NOTES:
─────────────
SERIALIZABLE: Data that can convert to JSON (strings, numbers, objects)
WRAPPING: Adding save/load to reducer without changing original logic  
REHYDRATE: Load localStorage → Redux (on app start)
PERSIST: Save Redux → localStorage (on state change)
IGNORE ACTIONS: Prevent warnings for persist's internal functions

WHY IGNORE:
- persist/PERSIST & persist/REHYDRATE contain functions (not serializable)
- Ignoring them = No warnings, but still checks YOUR code
- Better than: serializableCheck: false (disables ALL checks)
*/
