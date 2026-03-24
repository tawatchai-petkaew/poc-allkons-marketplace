type FeatureIconSize = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

type FeatureIconColor = 'primary' | 'secondary' | 'success' | 'danger';

interface Props {
  icon: React.ReactNode;
  size?: FeatureIconSize;
  color?: FeatureIconColor;
}

export default function FeatureIcon({
  icon,
  size = 'md',
  color = 'primary',
}: Props) {
  const resolveColors = (color: FeatureIconColor) => {
    switch (color) {
      case 'primary':
        return { textColor: 'text-primary-dark', bgColor: 'bg-primary-subtle' };

      default:
        return { textColor: 'text-primary-dark', bgColor: 'bg-primary-subtle' };
    }
  };

  const resolvePadding = (size: FeatureIconSize) => {
    switch (size) {
      case '2xl':
        return 'px-3 py-2';
      case 'xl':
        return 'px-3 py-2';
      case 'lg':
        return 'px-2 py-1';
      case 'md':
        return 'px-2 py-1';
      case 'sm':
        return 'px-2 py-1';
      case 'xs':
        return 'px-1';
      default:
        return 'px-2 py-2';
    }
  };

  const { textColor, bgColor } = resolveColors(color);
  return (
    <div
      className={`${bgColor} ${textColor} text-${size} rounded-full ${resolvePadding(
        size
      )}`}
    >
      {icon}
    </div>
  );
}
