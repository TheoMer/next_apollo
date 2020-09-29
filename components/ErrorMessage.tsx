import React, { memo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ErrorStyles = styled.div`
  /*padding: 2rem;*/
  background: white;
  margin: 2rem 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-left: 5px solid red;
  p {
    margin: 0.8rem; /* was formally 0 */
    font-weight: 100;
  }
  strong {
    margin-right: 1rem;
  }
`;
//Determine error
const DisplayError = ({ error, page }) => {
  //const { error, page } = props; 
  if (!error || !error.message) return null;

  if (error.message === "Cannot read property 'updateGuestEmail' of null") {
    error.message = "Error: A user with this email currently exists. Please select a different one.";
  }

  if (page == 'signin' && error.message.includes("null")) {
    error.message = 'Error: The email you specified does not exist on our system!'
  } else if (page == 'signup' && error.message.includes("null")) {
    error.message = 'Error: A user with the email you specified already exists!'
  } else if (page == 'reset' && error.message.includes("passwordexists")) {
    error.message = 'Error: You already use the password entered. Please choose a different one!'
  } else if (page == 'reset' && error.message.includes("unequalpasswords")) {
    error.message = 'Error: Your passwords are not yet equal!'
  }

  if (error.networkError && error.networkError.result && error.networkError.result.errors.length) {
    return error.networkError.result.errors.map((error, i) => (
      <ErrorStyles key={i}>
        <p data-test="graphql-error">
          <strong>Shoot!</strong>
          {error.message.replace('GraphQL error: ', '')}
        </p>
      </ErrorStyles>
    ));
  }
  return (
    <ErrorStyles>
      <p data-test="graphql-error">
        {/*<strong>Shoot!</strong>*/}
        {error.message.replace('GraphQL error: ', '')}
      </p>
    </ErrorStyles>
  );
};

DisplayError.defaultProps = {
  error: {},
};

DisplayError.propTypes = {
  error: PropTypes.object,
};

export default memo(DisplayError);
