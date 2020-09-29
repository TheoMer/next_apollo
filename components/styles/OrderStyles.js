import styled from 'styled-components';

/* OrderStyles */
const OrderStyles = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  border: 1px solid ${props => props.theme.offWhite};
  box-shadow: ${props => props.theme.bs};
  padding: 2rem;
  border-top: 10px solid black; /* Was formally blue */
  & > p {
    display: grid;
    grid-template-columns: 1fr 5fr;
    margin: 0;
    border-bottom: 1px solid ${props => props.theme.offWhite};
    span {
      padding: 1rem;
      &:first-child {
        font-weight: 900;
        text-align: right;
      }
    }
  }
  .order-item {
    border-bottom: 1px solid ${props => props.theme.offWhite};
    display: grid;
    grid-template-columns: 1fr 1fr; /*Was formally 300px 1fr */
    align-items: stretch; /* center */
    grid-gap: 2rem;
    margin: 2rem 0;
    padding-bottom: 2rem;
    img {
      width: 100%;
      /* height: 100%; */
      object-fit: cover;
      pointer-events: none; /* Removes the "save image" context */
    }
  }
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    font-family: Arial;
    line-height: 2.5rem;
    font-size: 12px;
    .order-item {
      img {
        height: 75%;
      }
    }
  }
`;
export default OrderStyles;

