import styled from 'styled-components';

const BigButton = styled.button`
    font-size: 3rem;
    background: none;
    border: 0;
    color: ${props => props.theme.black};
    &:hover {
        color: ${props => props.itemLoading ? props.theme.lightgrey : props.theme.red};
    cursor: pointer;
    }
`;

export { BigButton };
