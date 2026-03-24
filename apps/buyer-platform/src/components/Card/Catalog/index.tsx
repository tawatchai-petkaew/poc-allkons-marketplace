import { IProductCatalog } from '@/common/interfaces/ProductCatalog.interface';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import Typography from '../../Typography';
import './custom.css';

interface Props {
  catalog: IProductCatalog;
}

export default function CatalogCard({ catalog }: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  return (
    <div className="relative h-[320px] rounded-2xl w-full group overflow-hidden flex items-center justify-center">
      <Link
        href={`/catalog`}
        className="outline-none h-full flex items-center justify-center"
      >
        {catalog.imageUpload?.url && catalog.imageUpload?.url !== '' ? (
          <Image
            src={catalog?.imageUpload?.url}
            alt={catalog.name}
            width={0}
            height={0}
            loading="lazy"
            className="object-cover object-center w-full h-full rounded-2xl group-hover:scale-110 transition-all duration-200"
            onError={(e) => {
              const currentImg = e.currentTarget as HTMLImageElement;
              currentImg.src = '/assets/default-image.png';
              currentImg.className = `object-cover object-center w-[160px] h-[128px]`;
            }}
          />
        ) : (
          <Image
            src="/assets/default-image.png"
            alt={catalog.name}
            width={0}
            height={0}
            loading="lazy"
            className="object-cover object-center w-[160px] h-[128px]"
          />
        )}
        <div className="z-20 absolute bottom-0 left-0 right-0 flex items-center justify-between p-3">
          <div>
            <Typography
              variant={isMobile ? 'h2' : 'h5'}
              className="!text-white !line-clamp-1"
            >
              {catalog?.name}
            </Typography>
            {/* <Typography
              variant="paragraph-big"
              className="!font-regular !text-white !line-clamp-1"
            >
              {"888 รายการ"}
            </Typography> */}
          </div>
          <div className="border border-white rounded-full px-2 py-1 group-hover:bg-white group-hover:text-black transition-colors duration-200">
            <i className="ri-arrow-right-line text-white text-[1rem] font-semibold group-hover:text-black"></i>
          </div>
        </div>
        <div className="z-10 absolute inset-0 w-full h-full custom-gradient"></div>
      </Link>
    </div>
  );
}
