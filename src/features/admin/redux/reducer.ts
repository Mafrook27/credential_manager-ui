// src/features/admin/redux/reducer.ts

import { SET_SEARCH_QUERY, CLEAR_SEARCH } from './actionTypes';
import type { SearchState, SearchAction } from './types';

const initialState: SearchState = {
  query: '',
  isActive: false,
};

const searchReducer = (state = initialState, action: SearchAction): SearchState => {
  switch (action.type) {
    case SET_SEARCH_QUERY:
      return {
        ...state,
        query: action.payload || '',
        isActive: (action.payload?.length || 0) > 0,
      };
    
    case CLEAR_SEARCH:
      return initialState;
    
    default:
      return state;
  }
};

export default searchReducer;
