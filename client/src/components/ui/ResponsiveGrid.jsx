export default function ResponsiveGrid({
  as: Element = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Element
      className={`grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
}
