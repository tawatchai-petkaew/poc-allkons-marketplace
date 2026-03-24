import Typography from '@/components/Typography';
import {
  resolveBackground,
  resolveColor,
  resolveLeadingIcon,
  resolveText,
} from '@/utils/Label/label-status.utils';
import { Button, ConfigProvider } from 'antd';

interface Props {
  status:
    | 'closed'
    | 'todo'
    | 'edit'
    | 'failed'
    | 'pending'
    | 'success'
    | 'canceled'
    | 'draft';
}

export const LabelStatus = ({ status }: Props) => {
  return (
    <ConfigProvider>
      <Button
        variant="filled"
        size="middle"
        style={{
          borderRadius: 24,
          paddingRight: 8,
          paddingLeft: 4,
          minWidth: 24,
          background: resolveBackground(status),
          borderColor: resolveColor(status),
        }}
      >
        <div className="flex items-center gap-1">
          <div className="text-base" style={{ color: resolveColor(status) }}>
            <i className={resolveLeadingIcon(status)}></i>
          </div>

          <Typography
            variant="paragraph-extra-small"
            className={`font-regular`}
            style={{ color: 'var(--color-text-primary)' }}
          >
            {resolveText(status)}
          </Typography>
          {true && (
            <div className="text-base" style={{ color: resolveColor(status) }}>
              <i className={`${'ri-close-line'}`}></i>
            </div>
          )}
        </div>
      </Button>
    </ConfigProvider>
  );
};
