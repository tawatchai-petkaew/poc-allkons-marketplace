import { IArticle } from '@/common/interfaces/Ariticle.interface';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import { Grid } from 'antd';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  blog: IArticle;
}

export default function CardBlog({ blog }: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  return (
    <Link
      href={blog?.urlSlug || ''}
      className={`outline-none w-full`}
      onClick={(e) => {
        if (!blog?.urlSlug || blog?.urlSlug === '') {
          e.preventDefault();
        }
      }}
    >
      <div
        className={`overflow-hidden flex flex-col justify-center items-center ${
          isMobile ? 'gap-1' : 'gap-3'
        } cursor-pointer rounded-lg bg-background-primary/90 border-[1px] border-transparent transition-colors duration-300 w-full`}
      >
        <div
          className={`w-full rounded-2xl bg-background-secondary flex items-center justify-center !h-[9rem]`}
        >
          {blog.imageUpload?.url && blog.imageUpload?.url !== '' ? (
            <Image
              src={blog.imageUpload?.url}
              alt={blog.name}
              width={0}
              height={0}
              loading="lazy"
              className={`object-cover object-center w-full h-full rounded-2xl`}
              onError={(e) => {
                const currentImg = e.currentTarget as HTMLImageElement;
                currentImg.src = '/assets/default-image.png';
                currentImg.className = `object-contain object-center rounded-2xl w-[50%] h-auto`;
              }}
            />
          ) : (
            <Image
              src="/assets/default-image.png"
              alt={blog.name}
              width={0}
              height={0}
              loading="lazy"
              className={`object-contain object-center rounded-2xl w-[50%] h-auto`}
            />
          )}
        </div>
        <div className="flex flex-col w-full">
          <div className="flex gap-1 w-full justify-start flex-wrap">
            {blog?.tag?.map((tag: string) => (
              <Label
                key={tag}
                text={tag}
                variant="ghost"
                rounding="pill"
                size="small"
              />
            ))}
          </div>
          <Typography
            variant={isMobile ? 'paragraph-medium' : 'paragraph-big'}
            className={`!font-medium !text-text-primary leading-6 !line-clamp-2`}
          >
            {blog.titleSeo}
          </Typography>
          <Typography
            variant={isMobile ? 'paragraph-small' : 'paragraph-medium'}
            className={`!font-normal !text-text-tertiary leading-6 !line-clamp-2`}
          >
            {blog.descriptionSeo}
          </Typography>
        </div>
      </div>
    </Link>
  );
}
