import React from 'react';
import PleaseSignInAdmin from '../components/PleaseSignInAdmin';
import Permissions from '../components/Permissions';

const PermissionsPage = props => (
  <div>
    <PleaseSignInAdmin>
      <Permissions />
    </PleaseSignInAdmin>
  </div>
);

export default PermissionsPage;
