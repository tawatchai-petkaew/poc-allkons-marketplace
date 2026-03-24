import { IProductMerchant } from '@/common/interfaces/product.interface';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { getSoldDisplay } from '@/utils/format';
import NextImage from 'next/image';

export default function CardStore({
  merchantDetails,
}: {
  merchantDetails: IProductMerchant;
}) {
  const isMobile = useScreenWidth() < 768;
  return !isMobile ? (
    <div className="w-full bg-white border border-border-primary rounded-2xl p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Image container */}
          <div className="aspect-square flex items-center justify-center w-[128px] h-[128px]">
            {merchantDetails?.merchantLogo?.imageUpload?.url &&
            merchantDetails?.merchantLogo?.imageUpload?.url !== '' ? (
              <NextImage
                src={merchantDetails?.merchantLogo?.imageUpload?.url}
                width={0}
                height={0}
                alt={merchantDetails?.merchantTranslations[0].name || ''}
                className="w-full h-auto aspect-square"
                onError={(e) => {
                  e.currentTarget.src = '/assets/default-image.png';
                  e.currentTarget.className = 'w-full aspect-square';
                }}
              />
            ) : (
              <NextImage
                src={'/assets/default-image.png'}
                width={0}
                height={0}
                alt={merchantDetails?.merchantTranslations[0].name || ''}
                className="w-full aspect-square"
              />
            )}
          </div>
          <div className="flex flex-col justify-between md:min-h-[120px]">
            <div>
              <Typography variant="h4" className="!text-text-secondary">
                {merchantDetails?.store?.storeBranchName}
              </Typography>
              <Typography
                variant="paragraph-big"
                className="!text-text-tertiary"
              >
                {merchantDetails?.merchantTranslations[0].name}
              </Typography>
            </div>
            {/* Will Uncomment After Data Is Ready */}
            <div className="flex items-center gap-4">
              {/* Stars */}
              {/* <div className="flex items-center gap-2">
                <i className="ri-star-s-fill text-warning text-xl"></i>
                <i className="ri-star-s-fill text-warning text-xl"></i>
                <i className="ri-star-s-fill text-warning text-xl"></i>
                <i className="ri-star-s-fill text-warning text-xl"></i>
                <i className="ri-star-half-s-fill text-warning text-xl"></i>
              </div>
              <Typography
                variant="paragraph-medium"
                className="!text-text-quarternary"
              >
                4.5
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-quarternary !ml-2"
              >
                {`ขายแล้ว ${getSoldDisplay(99999999)} รายการ`}
              </Typography> */}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between items-end md:min-h-[120px]">
          <div className="flex items-center gap-5">
            <CustomButton
              icon={<i className="ri-share-line"></i>}
              variant="link"
              disabled
            ></CustomButton>
            <CustomButton
              icon={<i className="ri-heart-3-line"></i>}
              variant="link"
              disabled
            ></CustomButton>
          </div>
          <div className="flex items-center gap-5">
            <CustomButton
              icon={<i className="ri-chat-3-line"></i>}
              variant="outlined"
              color="neutral"
              disabled
            >
              พูดคุย
            </CustomButton>
            <CustomButton icon={<i className="ri-store-2-line"></i>} disabled>
              ดูสินค้าในร้าน
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full bg-white border border-border-primary rounded-2xl p-2">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-start gap-3 h-full">
          {merchantDetails?.merchantLogo?.imageUpload?.url &&
          merchantDetails?.merchantLogo?.imageUpload?.url !== '' ? (
            <NextImage
              src={merchantDetails?.merchantLogo?.imageUpload?.url}
              width={80}
              height={80}
              alt={merchantDetails?.merchantTranslations[0].name || ''}
              className="aspect-square"
              onError={(e) => {
                e.currentTarget.src = '/assets/default-image.png';
              }}
            />
          ) : (
            <NextImage
              src={'/assets/default-image.png'}
              width={80}
              height={80}
              alt={merchantDetails?.merchantTranslations[0].name || ''}
              className="aspect-square"
            />
          )}
          <div className="flex flex-col justify-between w-full h-[4.5rem]">
            <div>
              <div className="flex w-full justify-between items-center">
                <div>
                  <Typography variant="h6" className="!text-text-secondary">
                    {merchantDetails?.store?.storeBranchName}
                  </Typography>
                  <Typography
                    variant="paragraph-extra-small"
                    className="!text-text-tertiary"
                  >
                    {merchantDetails?.merchantTranslations[0].name}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <CustomButton
                    icon={<i className="ri-share-line"></i>}
                    variant="link"
                    disabled
                  ></CustomButton>
                  <CustomButton
                    icon={<i className="ri-heart-3-line"></i>}
                    variant="link"
                    disabled
                  ></CustomButton>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Will Uncomment After Data Is Ready */}
              {/* Stars */}
              {/* <div className="flex items-center gap-1">
                <i className="ri-star-s-fill text-warning text-xs"></i>
                <i className="ri-star-s-fill text-warning text-xs"></i>
                <i className="ri-star-s-fill text-warning text-xs"></i>
                <i className="ri-star-s-fill text-warning text-xs"></i>
                <i className="ri-star-half-s-fill text-warning text-xs"></i>
              </div>
              <Typography
                variant="paragraph-extra-small"
                className="!text-text-quarternary"
              >
                4.5
              </Typography>
              <Typography
                variant="paragraph-extra-small"
                className="!text-text-quarternary !ml-2"
              >
                {`ขายแล้ว ${getSoldDisplay(99999999)}${
                  isMobile ? "" : " รายการ"
                }`}
              </Typography> */}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CustomButton
            icon={<i className="ri-chat-3-line"></i>}
            variant="outlined"
            color="neutral"
            disabled
            className="!w-full"
          >
            พูดคุย
          </CustomButton>
          <CustomButton
            icon={<i className="ri-store-2-line"></i>}
            disabled
            className="!w-full"
          >
            ดูสินค้าในร้าน
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
