import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Typography from '../Typography';
import './custom.css';

interface Props {
  searchKeyword?: string;
  productName: string;
  imagePath?: string;
}

export default function SearchItem({
  searchKeyword = '',
  productName,
  imagePath = '',
}: Props) {
  const productNameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!productNameRef.current) return;

    const productNameElement =
      productNameRef?.current as unknown as HTMLElement;

    if (searchKeyword?.trim() !== '') {
      productNameElement.innerHTML = productName.replace(
        new RegExp(searchKeyword, 'gi'),
        '<highlight class="!text-primary">$&</highlight>'
      );
    } else {
      productNameElement.innerHTML = productName;
    }
  }, [searchKeyword]);

  return (
    <div className="flex items-center gap-3 hover:bg-background-secondary cursor-pointer px-3 py-2 rounded-2xl">
      <div className="flex items-center justify-center bg-white/90 rounded-2xl aspect-square w-[2rem] h-[2rem] sm:w-[48px] sm:h-[48px]">
        {imagePath != '' ? (
          <Image
            src={imagePath}
            alt={productName}
            width={0}
            height={0}
            className="object-cover object-center w-full h-full"
            onError={(e) => {
              const currentImg = e.currentTarget as HTMLImageElement;
              currentImg.src = '/assets/default-image.png';
              currentImg.className = `object-cover object-center w-[60%] h-auto`;
            }}
          />
        ) : (
          <Image
            src="/assets/default-image.png"
            alt={productName}
            width={0}
            height={0}
            className="object-cover object-center w-[60%] h-auto"
          />
        )}
      </div>
      <Typography
        variant="paragraph-medium"
        className="product-name !line-clamp-1"
      >
        <span ref={productNameRef}>{productName}</span>
      </Typography>
    </div>
  );
}
