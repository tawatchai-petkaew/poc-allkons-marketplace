import { Grid } from 'antd';
import Typography from '../Typography';

interface Props {
  prefixIcon?: React.ReactNode;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  prefixIcon,
  days,
  hours,
  minutes,
  seconds,
}: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  return (
    <div className="flex items-center gap-2 !text-white !text-2xl">
      {prefixIcon}
      <Typography variant={isMobile ? 'h2' : 'h4'} className="!text-white">
        {days < 10 ? '0' + days : days || '00'} วัน
      </Typography>
      <div className="px-2 py-1 bg-white/10 rounded-lg">
        <Typography variant={isMobile ? 'h2' : 'h4'} className="!text-white">
          {hours < 10 ? '0' + hours : hours || '00'}
        </Typography>
      </div>
      <Typography
        variant={isMobile ? 'h2' : 'h4'}
        className="!text-white !font-semibold"
      >
        :
      </Typography>
      <div className="px-2 py-1 bg-white/10 rounded-lg">
        <Typography variant={isMobile ? 'h2' : 'h4'} className="!text-white">
          {minutes < 10 ? '0' + minutes : minutes || '00'}
        </Typography>
      </div>
      <Typography
        variant={isMobile ? 'h2' : 'h4'}
        className="!text-white !font-semibold"
      >
        :
      </Typography>
      <div className="px-2 py-1 bg-white/10 rounded-lg">
        <Typography variant={isMobile ? 'h2' : 'h4'} className="!text-white">
          {seconds < 10 ? '0' + seconds : seconds || '00'}
        </Typography>
      </div>
    </div>
  );
}
