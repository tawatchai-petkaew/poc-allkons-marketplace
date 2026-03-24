import Typography from '@/components/Typography';

interface Props {
  title: string;
  count: number;
  active?: boolean;
}

export default function TabBarMenu({ title, count, active }: Props) {
  return (
    <div>
      <div className="flex gap-2 items-center">
        <Typography
          variant="paragraph-big"
          className={`${
            active
              ? '!text-icon-brand-dark !font-semibold'
              : '!text-text-quarternary'
          }`}
        >
          {title}
        </Typography>
        <div
          className={`rounded-full border px-2 py-1 flex items-center justify-center ${
            active
              ? '!border-utils-primary-p60 !bg-utils-primary-p90'
              : '!border-neutral-p80 !bg-neutral-p95'
          }  `}
        >
          <Typography
            variant="paragraph-extra-small"
            className={`${
              active ? '!text-utils-primary-p20' : '!text-neutral-60'
            }`}
          >
            {count}
          </Typography>
        </div>
      </div>
    </div>
  );
}
