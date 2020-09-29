import styled from 'styled-components';

const CartQuantityButton = styled.button`
    background: ${props => props.background}; /* I'm not sure about the grey colour on 'loading' */
    width: auto;
    color: white;
    border: 0;
    font-size: 1.4rem;
    font-weight: 200;
    padding: 0.5rem 1.2rem;
    display: inline-block;
    transition: all 0.5s;
    &[disabled] {
        opacity: 0.5;
    }
`;

export default CartQuantityButton;
