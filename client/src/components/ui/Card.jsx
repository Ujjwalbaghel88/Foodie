import { forwardRef } from "react";

const Card = forwardRef(function Card(
  { as: Element = "div", className = "", children, ...props },
  ref,
) {
  return (
    <Element
      ref={ref}
      className={`rounded-2xl border border-(--color-base-300) bg-(--color-base-100) text-(--color-base-content) shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
});

export default Card;
