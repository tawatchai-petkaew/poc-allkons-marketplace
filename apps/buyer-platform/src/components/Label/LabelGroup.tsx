import Typography from '@/components/Typography';
import { Button } from 'antd';
import {
  resolveBackground,
  resolveContextBackground,
  resolveTextColor,
} from '../../utils/Label/label-group.utils';

export type Themes =
  | 'default'
  | 'destructive'
  | 'warning'
  | 'primary'
  | 'gray'
  | 'success'
  | 'info'
  | 'white';

interface Props {
  theme?: Themes;
  context?: string;
  label?: string;
}

export const LabelGroup = ({
  theme = 'default',
  context = 'Context',
  label = 'Label',
}: Props) => {
  return (
    <div>
      <Button
        variant="filled"
        style={{
          background: resolveBackground(theme),
          borderRadius: 24,
          border: resolveTextColor(theme).border,
          padding: '0px 8px',
        }}
      >
        <div className="flex items-center gap-1">
          <div
            className="px-2 rounded-2xl"
            style={{
              background: resolveContextBackground(theme),
            }}
          >
            <Typography
              variant="paragraph-small"
              className="font-regular"
              style={{ color: resolveTextColor(theme).context }}
            >
              {context}
            </Typography>
          </div>
          <Typography
            variant="paragraph-small"
            className="font-regular"
            style={{ color: resolveTextColor(theme).label }}
          >
            {label}
          </Typography>
          <div
            className="text-base"
            style={{ color: resolveTextColor(theme).icon }}
          >
            <i className="ri-arrow-right-line"></i>
          </div>
        </div>
      </Button>
    </div>
  );
};
