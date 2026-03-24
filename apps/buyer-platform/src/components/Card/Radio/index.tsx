import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import { Tooltip } from 'antd';

type CardRadioProps = {
  isSelected: boolean;
  title: string;
  description?: string;
  label?: string;
  onClick?: () => void;
  vertical?: boolean;
  disabled?: boolean;
  tooltip?: boolean;
  tooltipText?: string;
};

const CardRadio: React.FC<CardRadioProps> = ({
  title,
  description,
  label,
  isSelected,
  vertical = false,
  onClick,
  disabled,
  tooltip,
  tooltipText,
}) => {
  return (
    <div
      className={`flex-1 flex gap-2 p-3 rounded-2xl cursor-pointer hover:bg-neutral-bg ${
        vertical ? 'flex-col' : 'flex-row items-center'
      }  border ${
        isSelected
          ? 'border-primary bg-background-secondary'
          : disabled
            ? 'bg-background-secondary border-background-secondary'
            : 'border-border-primary'
      } `}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      <div
        className={`rounded-full w-6 h-6 ${
          isSelected
            ? 'border-[7px] border-primary'
            : 'border border-neutral-hover-border'
        } `}
      />
      <div>
        <div className="flex gap-2 items-center">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary !font-medium"
          >
            {title}
          </Typography>
          {label && (
            <Label text={label} size="small" variant="ghost" rounding="pill" />
          )}
        </div>
        {description && (
          <Typography
            variant="paragraph-extra-small"
            className="!text-text-secondary"
          >
            {description}
          </Typography>
        )}
      </div>
      {tooltip && (
        <Tooltip
          placement="topRight"
          title={tooltipText}
          className="flex-1 flex w-fit justify-end"
        >
          <i className="ri-information-line text-2xl text-neutral-40"></i>
        </Tooltip>
      )}
    </div>
  );
};

export default CardRadio;
