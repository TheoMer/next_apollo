// Taken from: https://reacttricks.com/sharing-global-data-in-next-with-custom-app-and-usecontext-hook/
// https://daveceddia.com/usecontext-hook/
import React, { memo } from 'react';
import { createContext } from 'react';

const UserContext = createContext();

export default memo(UserContext);
