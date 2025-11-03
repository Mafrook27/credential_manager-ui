import { combineReducers } from 'redux';
import authReducer from '../features/auth/redux/reducer';
import searchReducer from '../features/admin/redux/reducer'; 

const rootReducer = combineReducers({
  auth: authReducer,
  admin: combineReducers({
    search: searchReducer,
  }),
});

export default rootReducer;
