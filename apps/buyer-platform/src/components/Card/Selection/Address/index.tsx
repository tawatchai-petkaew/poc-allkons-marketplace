import Button from '@/components/Button';
import { IAddress } from '@/components/Drawer/SelectAddress';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import { formatAddressDetail } from '@/utils/format';

type CardSelectionAddressProps = {
  isSelected: boolean;
  onClick?: () => void;
  onEditing?: () => void;
  vertical?: boolean;
  disabled?: boolean;
  address?: IAddress | null;
};

const CardSelectionAddress: React.FC<CardSelectionAddressProps> = ({
  isSelected,
  vertical = false,
  onClick,
  disabled,
  address = null,
  onEditing,
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditing?.();
  };

  const handleCardClick = () => {
    if (!disabled) {
      onClick?.();
    }
  };

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
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center">
        <div
          className={`rounded-full w-6 h-6 ${
            isSelected
              ? 'border-[7px] border-primary'
              : 'border border-neutral-hover-border'
          } `}
        />
        <Button
          variant="link"
          color="neutral"
          icon={<i className="ri-edit-line"></i>}
          fitContent
          onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
            if (e) handleEditClick(e);
          }}
        >
          แก้ไข
        </Button>
      </div>
      <div>
        <div className="flex  gap-2 items-center">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary !font-medium"
            ellipsis
            ellipsisOptions={{
              rows: 2,
            }}
          >
            {address?.addressName}
          </Typography>
          {address?.projectName && (
            <Label
              text={address.projectName}
              size="small"
              variant="ghost"
              rounding="pill"
            />
          )}
          {address?.isDefault && (
            <Label
              text="ค่าเริ่มต้น"
              size="small"
              variant="ghost"
              rounding="pill"
              color="success"
            />
          )}
        </div>
        <Typography variant="paragraph-small" className="!text-text-tertiary">
          {address?.contactName} | {address?.contactPhoneNumber}
        </Typography>
        <Typography
          variant="paragraph-small"
          ellipsis
          ellipsisOptions={{
            rows: 2,
          }}
          className="!text-text-tertiary"
        >
          {formatAddressDetail(address as IAddress)}
        </Typography>
      </div>
    </div>
  );
};

export default CardSelectionAddress;
