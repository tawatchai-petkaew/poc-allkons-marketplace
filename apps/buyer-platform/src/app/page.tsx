'use server';

import { getProductCategories } from '@/common/api/product-service/category.api';
import CategorySection from '@/components/HomeSections/CategorySection';
import { QueryClient } from '@tanstack/react-query';

export default async function Home() {
  const queryClient = new QueryClient();

  await Promise.all([
    // queryClient.prefetchQuery({
    //   queryKey: ["merchantBanners", slug],
    //   queryFn: () => getMerchantBanners(slug),
    // }),
    // queryClient.prefetchQuery({
    //   queryKey: ["bestSellers", slug],
    //   queryFn: () => getMerchantBestSellers(slug),
    // }),
    // queryClient.prefetchQuery({
    //   queryKey: ["featuredProducts", slug],
    //   queryFn: () => getMerchantFeaturedProducts(slug),
    // }),
    queryClient.prefetchQuery({
      queryKey: ['productCategories'],
      queryFn: () => getProductCategories(),
    }),
    // queryClient.prefetchQuery({
    //   queryKey: ["promotionBanners", slug],
    //   queryFn: () => getPromotionBanner(slug),
    // }),
    // queryClient.prefetchQuery({
    //   queryKey: ["productCatalogs", slug],
    //   queryFn: () => getProductCatalogs(slug),
    // }),
    // queryClient.prefetchQuery({
    //   queryKey: ["flashSales", slug],
    //   queryFn: () => getFlashSales(slug),
    // }),
    // queryClient.prefetchQuery({
    //   queryKey: ["merchantDetails", slug],
    //   queryFn: () => getMerchantDetails(slug),
    // }),
    // queryClient.prefetchQuery({
    //   queryKey: ["articles", slug],
    //   queryFn: () => getArticles(slug),
    // }),
  ]);

  return (
    <div>
      {/* <BannerSection slug={slug} /> */}
      <div className="mx-auto flex flex-col">
        <CategorySection />
        {/* <BestSellerSection slug={slug} />
        <FlashSalesSection slug={slug} />
        <CatalogSection slug={slug} />
        <FeaturedProductSection slug={slug} />
        <PromotionBannerSection slug={slug} />
        <ArticleSection slug={slug} /> */}
      </div>
    </div>
  );
}
