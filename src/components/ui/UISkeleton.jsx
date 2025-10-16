// src/components/ui/Skeleton.jsx
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const UISkeleton = ({
  count = 1,
  height = 20,
  width = "100%",
  circle = false,
  style = {},
  className = "",
}) => {
  return (
    <Skeleton
      count={count}
      height={height}
      width={width}
      circle={circle}
      style={style}
      className={className}
    />
  );
};

export default UISkeleton;
