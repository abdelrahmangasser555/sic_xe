import React from "react";
import clsx from "clsx";

type Status = "success" | "error" | "warning" | "info" | "neutral";

interface StatusDotProps {
  status: Status;
  size?: number; // in px
  className?: string; // for additional custom styles
}

const statusColorMap: Record<Status, string> = {
  success: "bg-green-500/70",
  error: "bg-red-500",
  warning: "bg-yellow-400",
  info: "bg-blue-500",
  neutral: "bg-gray-400",
};

const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 12,
  className,
}) => {
  const colorClass = statusColorMap[status] || statusColorMap["neutral"];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <span
        className={clsx(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          colorClass
        )}
        style={{ height: size, width: size }}
      ></span>
      <span
        className={clsx("relative inline-flex rounded-full", colorClass)}
        style={{ height: size, width: size }}
      ></span>
    </div>
  );
};

export default StatusDot;
