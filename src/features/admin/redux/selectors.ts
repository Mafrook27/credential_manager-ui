import type { RootState } from '../../../app/store';

export const selectSearchQuery = (state: RootState) => state.admin.search.query;
export const selectIsSearchActive = (state: RootState) => state.admin.search.isActive;
