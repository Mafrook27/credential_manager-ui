

import { SET_SEARCH_QUERY, CLEAR_SEARCH } from './actionTypes';
import type { SearchAction } from './types';

export const setSearchQuery = (query: string): SearchAction => ({
  type: SET_SEARCH_QUERY,
  payload: query,
});

export const clearSearch = (): SearchAction => ({
  type: CLEAR_SEARCH,
});


