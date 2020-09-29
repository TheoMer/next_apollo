import React, { memo, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';
import PropTypes from 'prop-types';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
];

enum Perms {
  ADMIN,
  GUEST_USER,
  ITEMCREATE,
  ITEMDELETE,
  ITEMUPDATE,
  PERMISSIONUPDATE,
  USER
}

interface updatePermissionsData {
  id: string;
  permissions2: Perms;
  name: string;
  email: string;

}

interface updatePermissionsVariables {
  permissions: Perms;
  userId: string;
}

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: String!) {
    updatePermissions(permissions2: $permissions, userId: $userId) {
      id
      permissions2
      name
      email
    }
  }
`;

interface permissions2 {
  permissions2: Perms
}

interface User {
  id: string;
  name: string;
  email: string;
  permissions2: permissions2;
}

interface AllUsersData {
  users: User[];
}

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions2
    }
  }
`;

const Permissions = props => {

  const { data, error, loading } = useQuery<AllUsersData, {}>(ALL_USERS_QUERY);

  return (
  <div>
    <Error error={error} page="" />
    {data.users && (
    <div>
      <h2>Manage Permissions</h2>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
            <th>👇🏻</th>
          </tr>
        </thead>
        <tbody>{data.users.map(user => <UserPermissions user={user} key={user.id} />)}</tbody>
      </Table>
    </div>
    )}
  </div>
  )
};

const UserPermissions = props => {

  console.log("props.user.permissions2 in permissions.js = ", props.user.permissions2)

  const [state, setState] = useState({
    permissions: props.user.permissions2
  });

  const handlePermissionChange = (e) => {
    const checkbox = e.target;
    // take a copy of the current permissions 
    let updatedPermissions = [...state.permissions];
    // figure out if we need to remove or add this permission
    if (checkbox.checked) {
      // add it in!
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
    }
    setState({
      ...state,
      permissions: updatedPermissions
    });
  };

  const user = props.user;
  console.log("User in Permissions.js = ", user);
  let Guest = user && user.permissions2.some(permission => ['GUEST_USER'].includes(permission));

  // UPDATE PERMISSIONS MUTATION
  const [ updatePermissions, { loading, error } ] = useMutation<
  { updatePermissions: updatePermissionsData }, // This __typename refers to Mutation 
  updatePermissionsVariables
  >(
    UPDATE_PERMISSIONS_MUTATION,
    { 
      variables: {  
        permissions: state.permissions,
        userId: props.user.id
      } 
    }
  );

  return (
    <>
      {error && <tr><td colSpan={8}><Error error={error} page="" /></td></tr>}
      {!Guest && (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                id={`${user.id}-permission-${permission}`}
                type="checkbox"
                checked={state.permissions.includes(permission)}
                value={permission}
                onChange={handlePermissionChange}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton type="button" background={loading ? props => props.theme.grey : props => props.theme.blue} disabled={loading} onClick={updatePermissions}>
            Updat{loading ? 'ing' : 'e'}
          </SickButton>
        </td>
      </tr>
      )}
    </>
  );
}

UserPermissions.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    id: PropTypes.string,
    permissions: PropTypes.array,
  }).isRequired
};

export default memo(Permissions);
export { ALL_USERS_QUERY };
