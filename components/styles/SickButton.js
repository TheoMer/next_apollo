import styled, { css } from 'styled-components';

const SickButton = styled.button`
  background: ${props => props.background}; /*${props => props.cartEmpty ? 'grey' : 'red'}; */ /* Cart empty/with items in it */
  width: 100%;
  color: white;
  font-weight: 500;
  border: 0;
  border-radius: 0;
  text-transform: uppercase;
  font-size: 2rem;
  padding: 0.8rem 1.5rem;
  transform: skew(-2deg);
  display: inline-block;
  transition: all 0.5s;
  &[disabled] {
    opacity: 0.5;
  }
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    font-family: Arial;
    text-transform: uppercase;
  }
  ${props => props.loggedout && css`
    /* background: props.background; */
    color: red;
  `}
`;

export default SickButton;
