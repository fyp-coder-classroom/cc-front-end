import { useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useRef, type FC, type ReactNode } from "react";

const PageTransition: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={location.pathname}
        nodeRef={nodeRef}
        timeout={200}
        classNames="page-transition"
        unmountOnExit
      >
        <div ref={nodeRef}>{children}</div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default PageTransition;
