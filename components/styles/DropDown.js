import styled, { keyframes } from 'styled-components';

const DropDown = styled.div`
  position: absolute;
  width: 100%;
  z-index: 2;
  border: 1px solid ${props => props.theme.lightgrey};
`;

const DropDownItem = styled.div`
  z-index: 2;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  background: ${props => (props.highlighted ? '#f7f7f7' : 'white')};
  padding: 1rem;
  transition: all 0.2s;
  ${props => (props.highlighted ? 'padding-left: 2rem;' : null)};
  display: flex;
  align-items: center;
  border-left: 10px solid ${props => (props.highlighted ? props.theme.lightgrey : 'white')};
  img {
    margin-right: 10px;
  }
`;

const glow = keyframes`
  from {
    box-shadow: 0 0 0px yellow;
  }

  to {
    box-shadow: 0 0 10px 1px yellow;
  }
`;

const SearchStyles = styled.div`
  position: relative;
  z-index: 1;
  input {
    width: 100%;
    padding: 10px;
    border: 0;
    font-size: 2rem;
    text-transform:capitalize;
    &.loading {
      animation: ${glow} 0.5s ease-in-out infinite alternate;
    }
  }
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    /* The opacity is set dependent on the cart being open or closed */
    /* This is becuae on the iPhone when removing an item from the cart */
    /* the div would momentarily re-render inside the cart window */
    opacity: ${props => (props.cartOpened ? 0 : 1)};
  }
`;

export { DropDown, DropDownItem, SearchStyles };

