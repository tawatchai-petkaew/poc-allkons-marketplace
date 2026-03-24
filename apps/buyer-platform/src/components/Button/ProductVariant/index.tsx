import { Grid } from 'antd';
import Typography from '../../Typography';

const ProductVariantButton = ({
  isActive = true,
  children,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  return (
    <div
      onClick={onClick}
      className={`relative px-4 py-2 border rounded-lg overflow-hidden hover:!border-primary cursor-pointer ${
        isActive ? '!border-primary' : '!border-border-primary'
      }`}
    >
      <Typography
        variant={isMobile ? 'paragraph-small' : 'paragraph-medium'}
        className={`!line-clamp-1 !text-start ${
          isActive ? '!text-primary' : '!text-text-secondary'
        }`}
      >
        {children}
      </Typography>
      {isActive && (
        <div
          className="absolute -top-1 -right-0.5 px-1 bg-primary"
          style={{ borderBottomLeftRadius: '12px' }}
        >
          <i className="ri-check-line text-white text-xs"></i>
        </div>
      )}
    </div>
  );
};

export default ProductVariantButton;
