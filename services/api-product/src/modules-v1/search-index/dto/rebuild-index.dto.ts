import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for triggering a full index rebuild
 */
export class RebuildIndexDto {
  @ApiPropertyOptional({
    description: 'Batch size for bulk indexing',
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Use blue-green deployment (create new index, switch alias)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  useBlueGreen?: boolean;

  @ApiPropertyOptional({
    description: 'Force rebuild even if a rebuild is in progress',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

/**
 * Response for rebuild status
 */
export class RebuildStatusDto {
  @ApiProperty({ description: 'Whether a rebuild is currently in progress' })
  inProgress: boolean;

  @ApiProperty({ description: 'Current index name' })
  currentIndex: string;

  @ApiProperty({ description: 'Total documents in current index' })
  documentCount: number;

  @ApiPropertyOptional({ description: 'New index being built (if rebuilding)' })
  newIndex?: string;

  @ApiPropertyOptional({ description: 'Progress percentage (if rebuilding)' })
  progress?: number;

  @ApiPropertyOptional({ description: 'Estimated time remaining in seconds' })
  estimatedTimeRemaining?: number;

  @ApiProperty({ description: 'Last rebuild timestamp' })
  lastRebuildAt: string | null;
}
