export const NextArrow = (props: any) => {
  const { onClick, customStyles, className, dynamicArrow = false } = props;

  const isDisabled = className?.includes('slick-disabled');

  if (isDisabled && dynamicArrow) return null;
  return (
    <div
      onClick={onClick}
      className={`${'absolute right-8 top-1/2 z-10 -translate-y-1/2 md:flex'} cursor-pointer text-xl text-brand-icon w-12 h-12 hidden items-center justify-center bg-primary-background rounded-lg hover:bg-primary-background-hover transition-colors duration-300 ${customStyles}`}
    >
      <i className="ri-arrow-right-s-line"></i>
    </div>
  );
};

export const PrevArrow = (props: any) => {
  const { onClick, customStyles, className, dynamicArrow = false } = props;

  const isDisabled = className?.includes('slick-disabled');

  if (isDisabled && dynamicArrow) return null;

  return (
    <div
      onClick={onClick}
      className={`${'absolute left-8 top-1/2 z-10 -translate-y-1/2 md:flex'} cursor-pointer text-xl text-brand-icon w-12 h-12 hidden items-center justify-center bg-primary-background rounded-lg hover:bg-primary-background-hover transition-colors duration-300 ${customStyles}`}
    >
      <i className="ri-arrow-left-s-line"></i>
    </div>
  );
};

export const BorderedPrevArrow = (props: any) => {
  const { onClick, isMobile, disabled, customStyles = '' } = props;
  return (
    <div
      onClick={onClick}
      className={`absolute  -top-14 z-10 cursor-pointer text-xl text-neutral-text w-10 h-10 flex items-center justify-center border border-neutral-border hover:border-neutral-hover-border transition-colors duration-100 rounded-lg ${
        isMobile ? 'right-16' : 'right-[88px]'
      } ${customStyles} ${
        disabled ? '!opacity-50 !cursor-not-allowed !pointer-events-none' : ''
      }`}
    >
      <i className="ri-arrow-left-s-line"></i>
    </div>
  );
};

export const BorderedNextArrow = (props: any) => {
  const { onClick, isMobile, disabled, customStyles = '' } = props;
  return (
    <div
      onClick={onClick}
      className={`absolute  -top-14 z-10 cursor-pointer text-xl text-neutral-text w-10 h-10 flex items-center justify-center border border-neutral-border hover:border-neutral-hover-border transition-colors duration-100 rounded-lg ${
        isMobile ? 'right-3' : 'right-10'
      } ${customStyles} ${
        disabled ? '!opacity-50 !cursor-not-allowed !pointer-events-none' : ''
      }`}
    >
      <i className="ri-arrow-right-s-line"></i>
    </div>
  );
};
