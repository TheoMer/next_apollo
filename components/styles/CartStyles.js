import styled from 'styled-components';

const CartStyles = styled.div`
  padding: 20px;
  position: relative;
  background: white;
  position: fixed;
  height: 100%;
  top: 0;
  right: 0;
  width: 40%;
  min-width: 500px;
  bottom: 0;
  transform: translateX(100%);
  transition: all 0.3s;
  box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0.6); /* Was formally 0.2 */
  z-index: 9999; /* Was formally 5 */
  display: grid;
  grid-template-rows: auto 1fr auto;
  ${props => props.open && `transform: translateX(0);`};
  header {
    border-bottom: 5px solid ${props => props.theme.black};
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }
  footer {
    border-top: 10px double ${props => props.theme.black};
    margin-top: 2rem;
    margin-bottom: 6.5rem;
    padding-top: 2rem;
    display: grid;
    grid-template-columns: auto; /* Was formally auto auto */
    align-items: center;
    font-size: 1.7rem;
    font-weight: 900;
    p {
      margin: 0;
    }
  }
  buttonfooter {
    position: fixed;
    bottom: 0;
    width: 91%;
    margin-bottom: 0rem;
    margin-left: 2.5rem;
  }   
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: scroll;
  }
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    ul {
      margin-left: 7.4rem;
      font-size: 11px;
    }
    footer {
      margin-left: 7.4rem;
    }
    buttonfooter {
      width: 76%;
      margin-left: 9.8rem;
      margin-bottom: 0rem;
    }
    header {
      margin-left: 7.4rem;
    }
  }
`;

export default CartStyles;
