'use client';
import { useScreenHeight } from '@/hooks/useScreenHeight';
import { Grid } from 'antd';
import { FloatButton } from 'antd/lib';

interface Props {
  bottom?: number;
}

export const FloatButtons = ({ bottom }: Props) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const screenHeight = useScreenHeight();

  return (
    <div>
      {/* jump to top */}
      <FloatButton.BackTop
        style={{
          width: isMobile ? '40px' : '48px',
          height: isMobile ? '40px' : '48px',
          bottom: bottom ? bottom : '',
        }}
        icon={<i className="ri-arrow-up-s-line"></i>}
        visibilityHeight={screenHeight + 300}
      />
    </div>
  );
};
