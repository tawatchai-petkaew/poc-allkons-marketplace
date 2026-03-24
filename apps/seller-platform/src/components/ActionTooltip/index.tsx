"use client";

import { Tooltip } from "antd";
import type { TooltipProps } from "antd";

type ActionTooltipProps = TooltipProps & {
  children: React.ReactNode;
};

const ActionTooltip: React.FC<ActionTooltipProps> = ({ children, ...props }) => {
  return (
    <Tooltip {...props}>
      <span>{children}</span>
    </Tooltip>
  );
};

export default ActionTooltip;
