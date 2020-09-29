import styled from 'styled-components';

const Supreme = styled.h3`
  background: ${props => props.theme.blue};
  color: white;
  display: inline-block;
  padding: 4px 5px;
  transform: skew(-3deg);
  margin: 0;
  font-size: 4rem;
  width: 100%; /* Cart heading now spans properly */
  text-align: center;
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    font-size: 2rem;
  }
`;

export default Supreme;
