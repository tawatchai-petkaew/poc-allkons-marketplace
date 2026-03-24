'use client';
import { getArticles } from '@/common/api/customer-service/merchant.api';
import { IArticle } from '@/common/interfaces/Ariticle.interface';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import CardBlog from '../../Card/Blog';
import Typography from '../../Typography';

interface Props {
  slug: string;
}

export default function ArticleSection({ slug }: Props) {
  const { data, error } = useQuery({
    queryKey: ['articles', slug],
    queryFn: () => getArticles(slug),
  });
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const articles = data?.data || [];
  const displayArticles =
    articles.length > 4 ? articles.slice(0, 4) : articles || [];

  if (articles.length === 0 || error) {
    return null;
  }

  return (
    <div className="container mx-auto py-[3rem]">
      <div
        className={`flex items-center justify-between ${
          isMobile ? 'px-3' : 'px-5'
        }`}
      >
        <div className="flex items-center gap-2">
          <Typography
            variant={isMobile ? 'h2' : 'h3'}
            className="!text-text-primary"
          >
            บทความ
          </Typography>
          <Typography
            variant={isMobile ? 'h2' : 'h3'}
            className="!text-primary"
          >
            ของเรา
          </Typography>
        </div>
        <div className="flex items-center gap-2 cursor-pointer px-2 py-1">
          <Typography variant="button-middle" className="!text-button-tertiary">
            ดูทั้งหมด
          </Typography>
          <i className="ri-arrow-right-line !text-button-tertiary"></i>
        </div>
      </div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 px-3 mt-5 gap-[1rem] lg:gap-[2rem]`}
      >
        {displayArticles?.map((article: IArticle) => (
          <CardBlog key={article.id} blog={article} />
        ))}
      </div>
    </div>
  );
}
