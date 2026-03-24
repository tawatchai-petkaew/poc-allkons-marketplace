'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Tooltip, TooltipProps } from 'antd';

interface TextWithTooltipProps {
  text: React.ReactNode;
  maxLines?: number;
  className?: string;
  children?: React.ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
  tooltipProps?: Partial<TooltipProps>;
  style?: React.CSSProperties;
}

/**
 * TextWithTooltip Component
 * 
 * A reusable component that automatically shows a tooltip when text overflows
 * beyond the specified number of lines.
 */
const TextWithTooltip: React.FC<TextWithTooltipProps> = ({
  text,
  maxLines = 2,
  className = '',
  children,
  tooltipPlacement = 'top',
  tooltipProps = {},
  style = {},
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const checkOverflow = useCallback(() => {
    const element = textRef.current;
    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 
                      parseFloat(computedStyle.fontSize) * 1.5 || 
                      20;
    
    const maxHeight = lineHeight * maxLines;
    const isOverflowing = element.scrollHeight > maxHeight + 1;
    
    setShowTooltip(isOverflowing);
  }, [maxLines]);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    let debounceTimeout: NodeJS.Timeout;
    const debouncedCheckOverflow = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(checkOverflow, 16);
    };

    const initialTimeout = setTimeout(checkOverflow, 100);

    if (window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(debouncedCheckOverflow);
      resizeObserverRef.current.observe(element);
    }

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(debounceTimeout);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [checkOverflow]);

  const tooltipTitle = useMemo(() => {
    if (typeof text === 'string' && text.trim()) {
      return text;
    }
    if (React.isValidElement(text)) {
      return text;
    }
    return null;
  }, [text]);

  const content = useMemo(() => children || text, [children, text]);

  const containerStyle: React.CSSProperties = useMemo(() => ({
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    width: '100%',
    lineHeight: '1.5',
    ...style,
  }), [maxLines, style]);

  const contentElement = (
    <div 
      ref={textRef} 
      className={className}
      style={containerStyle}
    >
      {content}
    </div>
  );

  if (showTooltip && tooltipTitle) {
    return (
      <Tooltip 
        title={tooltipTitle} 
        placement={tooltipPlacement}
        color="#FFFFFF"
        trigger="click"
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
        overlayStyle={{ maxWidth: '300px' }}
        overlayInnerStyle={{
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: '12px',
          padding: '8px 12px',
          border: 'none',
        }}
        {...tooltipProps}
      >
        <div className="cursor-pointer">
          {contentElement}
        </div>
      </Tooltip>
    );
  }

  return contentElement;
};

export default memo(TextWithTooltip);
