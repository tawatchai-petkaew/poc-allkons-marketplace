'use client';
import CardProduct from '@/components/Card/Product';
import { BorderedNextArrow, BorderedPrevArrow } from '@/components/Carousel';
import { FloatButtons } from '@/components/FloatButtons';
import Typography from '@/components/Typography';
import { Grid, Pagination } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import MockUpProductForCategory from '@/__mocks__/MockUpProductForCategory.json';

export default function SearchPage() {
  const params = useParams();
  const decodedKeyword = decodeURIComponent(params?.keyword as string);

  const products = MockUpProductForCategory;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const totalPages = Math.ceil(products.length / itemPerPage);

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  return (
    <div className="bg-background-primary">
      <div className="container mx-auto px-3 sm:px-0">
        <div className="flex flex-col gap-6 py-6">
          <Link href="/" className="flex gap-2 items-center">
            <Typography variant="paragraph-medium">กลับสู่หน้าหลัก</Typography>
          </Link>
          <div className="flex items-center gap-2">
            <Typography variant={`page-title`} className="!text-gray-500">
              ผลลัพธ์การค้นหา
            </Typography>
            <Typography variant={`page-title`}>“{decodedKeyword}”</Typography>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <Typography
              variant="paragraph-small"
              className="!text-text-quarternary"
            >
              ทั้งหมด
            </Typography>
            <Typography variant="h6" className="!text-text-secondary">
              {products.length}
            </Typography>
            <Typography
              variant="paragraph-small"
              className="!text-text-quarternary"
            >
              รายการ
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <Typography
              variant="paragraph-small"
              className="!text-text-secondary"
            >
              {currentPage}/{totalPages}
            </Typography>
            <div className="flex gap-2">
              <BorderedPrevArrow
                customStyles="!static"
                disabled={currentPage === 1}
                onClick={() => {
                  window.scrollTo(0, 0);
                  setCurrentPage(currentPage - 1);
                }}
              />
              <BorderedNextArrow
                customStyles="!static"
                disabled={currentPage === totalPages}
                onClick={() => {
                  window.scrollTo(0, 0);
                  setCurrentPage(currentPage + 1);
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-[2rem]">
          {products
            .slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage)
            .map((item: any) => (
              <div key={item.id}>
                <CardProduct product={item} />
              </div>
            ))}
        </div>
        {!isMobile ? (
          <div className="w-full mt-[2rem] mb-[1rem] flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                {`ทั้งหมด ${products.length} รายการ`}
              </Typography>
            </div>
            <Pagination
              showSizeChanger
              defaultCurrent={currentPage}
              current={currentPage}
              pageSize={itemPerPage}
              total={products.length}
              pageSizeOptions={[30, 60, 90]}
              onChange={(page) => {
                window.scrollTo(0, 0);
                setCurrentPage(page);
              }}
              onShowSizeChange={(page, pageSize) => {
                window.scrollTo(0, 0);
                setItemPerPage(pageSize);
              }}
              locale={{
                items_per_page: ' / หน้า',
                prev_page: 'ย้อนกลับ',
                next_page: 'หน้าถัดไป',
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between mt-6">
            <BorderedPrevArrow
              customStyles="!static"
              disabled={currentPage === 1}
              onClick={() => {
                window.scrollTo(0, 0);
                setCurrentPage(currentPage - 1);
              }}
            />
            <Typography variant="paragraph-extra-small">{`หน้าที่ ${currentPage}/${totalPages}`}</Typography>
            <BorderedNextArrow
              customStyles="!static"
              disabled={currentPage === totalPages}
              onClick={() => {
                window.scrollTo(0, 0);
                setCurrentPage(currentPage + 1);
              }}
            />
          </div>
        )}
      </div>
      <FloatButtons />
    </div>
  );
}
