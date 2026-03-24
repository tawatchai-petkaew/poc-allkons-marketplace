import Typography from '@/components/Typography';
import { Button } from 'antd';

interface Props {
  active?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function TabButton({
  active = false,
  children = '',
  icon,
  onClick,
}: Props) {
  return (
    <Button
      variant={active ? 'solid' : 'outlined'}
      className={`!rounded-full !h-[2rem] md:!h-[2.5rem] ${
        active
          ? '!bg-primary !text-white !border-none !outline-none'
          : 'border !border-border-primary hover:!border-primary group'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {icon}
        <Typography
          variant="paragraph-small"
          className={`!font-normal ${
            active ? '!text-white' : 'group-hover:!text-primary '
          }`}
          onClick={onClick}
        >
          {children}
        </Typography>
      </div>
    </Button>
  );
}
