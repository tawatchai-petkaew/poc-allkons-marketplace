export * from './rebuild-index.dto';

// Re-export from merchant-product for backward compatibility
export {
  SearchDocumentDto,
  SearchProductRequestDto,
  SearchProductResponseDto,
  FacetDto,
  PaginationDto,
  AutocompleteResponseDto,
} from '../indices/merchant-product';
