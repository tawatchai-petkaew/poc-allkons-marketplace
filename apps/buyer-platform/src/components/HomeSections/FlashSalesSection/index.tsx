'use client';

import { getFlashSales } from '@/common/api/product-service/product.api';
import { ThaiMonths } from '@/common/enum/ThaiMonths.enum';
import {
  IFlashSale,
  ProductFlashSale,
} from '@/common/interfaces/FlashSales.interface';
import { calculateDiscountPercentage } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import CardPromotion from '../../Card/Promotion';
import CountdownTimer from '../../CountdownTimer';
import Typography from '../../Typography';

interface Props {
  slug: string;
}

const sortFlashSalesItems = (products: ProductFlashSale[]) => {
  if (products?.length > 1) {
    const sorted = products?.sort(
      (a: ProductFlashSale, b: ProductFlashSale) => {
        const discountA = calculateDiscountPercentage(
          a.product?.productItems[0].price,
          a.product?.productItems[0].productDiscount?.value || 0
        );
        const discountB = calculateDiscountPercentage(
          b.product?.productItems[0].price,
          b.product?.productItems[0].productDiscount?.value || 0
        );

        let result = discountB - discountA;

        if (discountB === discountA) {
          result = b.product.soldQuantity - a.product.soldQuantity;
        }

        if (b.product.soldQuantity === a.product.soldQuantity) {
          result =
            b.product?.productItems[0].productDiscount?.value ||
            0 - (a.product?.productItems[0].productDiscount?.value || 0);
        }

        return result;
      }
    );
    return sorted;
  }
  return products;
};

export default function FlashSalesSection({ slug }: Props) {
  const { data: flashSalesQuery, error: errorFlashSales } = useQuery({
    queryKey: ['flashSales', slug],
    queryFn: () => getFlashSales(slug),
    enabled: !!slug,
  });

  const flashSales: IFlashSale | null = useMemo(
    () =>
      (flashSalesQuery?.data && {
        ...flashSalesQuery?.data,
        productFlashSales: sortFlashSalesItems(
          flashSalesQuery?.data?.productFlashSales
        ),
      }) ||
      null,
    [flashSalesQuery?.data]
  );

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    const target = new Date(flashSales?.endDate || '');

    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = target.getTime() - now.getTime();

      if (timeDiff <= 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSales]);

  const isExpired = days === 0 && hours === 0 && minutes === 0 && seconds === 0;

  if (!flashSales || errorFlashSales) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-primary-p20">
      <div
        className={`container mx-auto  ${
          isMobile ? 'px-3 pt-[2.5rem] pb-[2.5rem]' : 'px-7 pt-[3rem] pb-[4rem]'
        }`}
      >
        {!isMobile ? (
          <div>
            <Typography
              variant={isMobile ? 'h2' : 'h3'}
              className="!text-white"
            >
              โปรโมชั่นสุดพิเศษ
            </Typography>
            <div className="flex justify-between">
              <Typography variant="paragraph-medium" className="!text-white">
                {`ประจำเดือน${ThaiMonths[new Date().getMonth() + 1]}`}
              </Typography>
              <div className="flex items-center gap-7">
                <div>
                  <CountdownTimer
                    prefixIcon={<i className="ri-flashlight-fill text-xl"></i>}
                    days={days}
                    hours={hours}
                    minutes={minutes}
                    seconds={seconds}
                  />
                </div>
                {flashSales?.productFlashSales?.length > 3 && (
                  <div className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-primary/40 rounded-lg transition-all duration-100">
                    <Typography
                      variant="paragraph-medium"
                      className="!text-white"
                    >
                      ดูทั้งหมด
                    </Typography>
                    <i className="ri-arrow-right-line !text-white"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Typography
                  variant={isMobile ? 'h2' : 'h3'}
                  className="!text-white"
                >
                  โปรโมชั่นสุดพิเศษ
                </Typography>
                <Typography variant="paragraph-medium" className="!text-white">
                  {`ประจำเดือน${ThaiMonths[new Date().getMonth() + 1]}`}
                </Typography>
              </div>
              {flashSales?.productFlashSales?.length > 3 && (
                <div className="flex items-center gap-2">
                  <Typography
                    variant="paragraph-medium"
                    className="!text-white"
                  >
                    ดูทั้งหมด
                  </Typography>
                  <i className="ri-arrow-right-line !text-white"></i>
                </div>
              )}
            </div>
            <div className="mx-auto w-fit mt-3">
              <CountdownTimer
                days={days}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
              />
            </div>
          </div>
        )}
        <div
          className={`grid gap-6 lg:grid-cols-3 grid-cols-1
           mt-5`}
        >
          {flashSales?.productFlashSales?.map((item) => (
            <CardPromotion key={item.id} product={item} isExpired={isExpired} />
          ))}
        </div>
      </div>
    </div>
  );
}
