
export interface SearchState {
  query: string;
  isActive: boolean;
 
}

export interface SearchAction {
  type: string;
  payload?: string;
}
