import React, { memo, useEffect, useRef } from 'react';

//const scrollToComp = el => el && window.scrollTo(0, el.offsetTop);

//Scroll to top.
const ScrollToTop = ({ children }) => {
  //const topRef = useRef(null);

  useEffect(() => {
    // Info regarding scrolling taken from: https://www.leighhalliday.com/using-refs-in-react
    // and here: https://reacttraining.com/react-router/web/guides/scroll-restoration/scroll-to-top
    // and here: https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move

    //topRef.current.scrollTo(0, 0);
    //topRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    window.scrollTo(0, 0);
    
    //scrollToComp(topRef);
  },[]);

  // Note: In a return you would access the ref as follows
  // <div ref={topRef} id="top"></div>

  return children || null;
}

export default memo(ScrollToTop);
