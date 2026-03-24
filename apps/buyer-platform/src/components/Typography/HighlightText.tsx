import React, { useMemo } from 'react';
import Typography, {
  TypographyProps,
  TypographyVariant,
} from '@/components/Typography';

interface PropsHighlightText {
  searchKeyword?: string;
  text: string;
  variant: TypographyVariant;
  className?: string;
  ellipsis?: TypographyProps['ellipsis'];
  ellipsisOptions?: TypographyProps['ellipsisOptions'];
}

const TypographyHighlightText = ({
  searchKeyword,
  text,
  variant,
  className,
  ellipsis = false,
  ellipsisOptions,
}: PropsHighlightText) => {
  const segments = useMemo(() => {
    const keyword = searchKeyword?.trim();
    if (!keyword) return [text];

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.split(regex).filter((segment) => segment.length > 0);
  }, [searchKeyword, text]);

  const keywordLower = searchKeyword?.trim().toLowerCase() ?? '';

  return (
    <Typography
      variant={variant}
      className={className}
      ellipsis={ellipsis}
      ellipsisOptions={ellipsisOptions}
    >
      {segments.map((segment, index) => {
        const isMatch =
          keywordLower.length > 0 &&
          segment.toLowerCase() === keywordLower.toLowerCase();
        if (isMatch) {
          return (
            <span key={`highlight-${segment}-${index}`} className="!text-primary">
              {segment}
            </span>
          );
        }
        return <span key={`text-${segment}-${index}`}>{segment}</span>;
      })}
    </Typography>
  );
};

export default TypographyHighlightText;
