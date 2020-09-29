import styled from 'styled-components';

const Dot = styled.div`
    background: ${props => props.theme.blue};
    /*background-image: url(${img});*/
    color: white;
    border-radius: 50%;
    padding: 0.5rem;
    line-height: 2rem;
    min-width: 3rem;
    margin-left: 1rem;
    font-weight: 100;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
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

export { Dot };
