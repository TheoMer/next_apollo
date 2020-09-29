import styled from 'styled-components';

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 3rem auto; /* Was formally 2rem */
  box-shadow: ${props => props.theme.bs};
  /* display: grid; */
  grid-auto-columns: 1fr 1fr;
  grid-auto-flow: column;
  /*min-height: 570px; /* Was formally 800 */
  min-height: 0;
  min-width: 0;
  img {
    width: 100%;
    height: 400px; /* Was formally 100% */
    object-fit: contain;
    pointer-events: none; /* Removes the "save image" context */
  }
  .details {
    margin: 3rem;
    font-size: 1.6rem; /* Was formally 2 */
  }
  .fluid__image-container {
    margin: 30px;
    height: fit-content;
  }
  .cartButton {
    grid-area: 2 / 1 / span 1 / span 2; /* convention = row / col / row / col */
  }
  slick-prev {
  background-color: rgb(187, 184, 184);
  border-radius: 10px;
  }
  slick-next {
  background-color: rgb(187, 184, 184);
  border-radius: 10px;
  }
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    min-height: 450px;
    .details {
      margin-top: 0px;
      margin-left: 2rem;
      font-family: Arial;
      line-height: 2.5rem;
      font-size: 12px;
      width: 95%;
      height: fit-content;      
    }
  }
`;

export default SingleItemStyles;