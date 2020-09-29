import styled from 'styled-components';

const Item = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.offWhite};
  box-shadow: ${props => props.theme.bs};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch; /* This properly sizes the images instead of using height: 100% */
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    font-family: Arial;
    line-height: 2.5rem;
    font-size: 12px;
  }
  img {
    width: 100%;
    /* height: 100%; */ /* 400px; */
    object-fit: cover;
    pointer-events: none; /* Removes the "save image" context*/
  }
  p {
    line-height: 2;
    font-weight: 300;
    flex-grow: 1;
    padding: 0 3rem;
    font-size: 1.5rem;
  }
  .price {
    font-size: 2.2rem;
  }
  .buttonList {
    display: grid;
    width: 100%;
    /* border-top: 1px solid ${props => props.theme.lightgrey}; */
    border-top: 1px solid ${props => props.theme.offWhite};
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-gap: 1px;
    /* background: ${props => props.theme.lightgrey}; */
    background: ${props => props.theme.offWhite};
    & > * {
      background: white;
      border: 0;
      font-size: 1rem;
      padding: 1rem;
    }
  }
`;

export default Item;

