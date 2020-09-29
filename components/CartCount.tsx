import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { Dot } from './styles/Dot';
import { useCart } from './LocalState';
// import img from '../static/shopping-cart.png';

const AnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    transition: all 0.4s;
    backface-visibility: hidden;
  }
  /* Initial State of the entered Dot */
  .count-enter {
    transform: scale(4) rotateX(0.5turn);
  }
  .count-enter-active {
    transform: rotateX(0);
  }
  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0);
  }
  .count-exit-active {
    transform: scale(4) rotateX(0.5turn);
  }
`;

const CartCount = ({ count }) => {
  const { cartOpen } = useCart();

  return (
    <AnimationStyles>
      <TransitionGroup>
        <CSSTransition
          unmountOnExit
          className="count"
          classNames="count"
          key={count}
          timeout={{ enter: 400, exit: 400 }}
        >
          <Dot
            cartOpened={cartOpen}
          >{count}</Dot>
        </CSSTransition>
      </TransitionGroup>
    </AnimationStyles>
  )
}

CartCount.propTypes = {
  count: PropTypes.number.isRequired,
};

export default memo(CartCount);
