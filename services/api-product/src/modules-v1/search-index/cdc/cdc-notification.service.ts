import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Notification payload for CDC error alerts
 */
export interface CdcErrorNotification {
  changeId: number;
  entityType: string;
  entityId: number;
  errorCount: number;
  lastError: string;
  skippedAt: Date;
}

/**
 * CDC Notification Service
 *
 * Sends notifications when CDC records fail processing multiple times.
 * Supports multiple notification channels:
 * - Discord (via webhook)
 * - Slack (via webhook) - future support
 * - Line Notify - future support
 *
 * Configuration via environment variables:
 * - CDC_NOTIFICATION_WEBHOOK_URL: Discord/Slack webhook URL
 * - CDC_NOTIFICATION_ENABLED: Enable/disable notifications (default: true)
 */
@Injectable()
export class CdcNotificationService {
  private readonly logger = new Logger(CdcNotificationService.name);
  private readonly webhookUrl: string | null;
  private readonly isEnabled: boolean;
  private readonly serviceName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.webhookUrl =
      this.configService.get<string>('CDC_NOTIFICATION_WEBHOOK_URL') || null;
    this.isEnabled =
      this.configService.get<boolean>('CDC_NOTIFICATION_ENABLED', true) &&
      !!this.webhookUrl;
    this.serviceName = this.configService.get<string>(
      'SERVICE_NAME',
      'allkons-marketplace-api-product',
    );
  }

  /**
   * Send notification when a CDC record is skipped due to max retries
   */
  async notifySkippedRecord(notification: CdcErrorNotification): Promise<void> {
    if (!this.isEnabled) {
      this.logger.debug(
        `Notification disabled, skipping alert for change ID: ${notification.changeId}`,
      );
      return;
    }

    try {
      const payload = this.buildDiscordPayload(notification);
      await this.sendWebhook(payload);
      this.logger.log(
        `Notification sent for skipped CDC record: ${notification.changeId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send notification for change ID ${notification.changeId}: ${errorMessage}`,
      );
      // Don't throw - notification failure shouldn't affect main processing
    }
  }

  /**
   * Send batch notification for multiple skipped records
   */
  async notifyMultipleSkippedRecords(
    notifications: CdcErrorNotification[],
  ): Promise<void> {
    if (!this.isEnabled || notifications.length === 0) {
      return;
    }

    try {
      const payload = this.buildBatchDiscordPayload(notifications);
      await this.sendWebhook(payload);
      this.logger.log(
        `Batch notification sent for ${notifications.length} skipped CDC records`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send batch notification: ${errorMessage}`);
    }
  }

  /**
   * Build Discord webhook payload for single notification
   */
  private buildDiscordPayload(notification: CdcErrorNotification): object {
    return {
      username: 'CDC Alert Bot',
      embeds: [
        {
          title: '⚠️ CDC Record Skipped - Max Retries Exceeded',
          color: 15158332, // Red color
          fields: [
            {
              name: 'Service',
              value: this.serviceName,
              inline: true,
            },
            {
              name: 'Change ID',
              value: notification.changeId.toString(),
              inline: true,
            },
            {
              name: 'Entity',
              value: `${notification.entityType} (ID: ${notification.entityId})`,
              inline: true,
            },
            {
              name: 'Error Count',
              value: notification.errorCount.toString(),
              inline: true,
            },
            {
              name: 'Last Error',
              value:
                notification.lastError?.substring(0, 500) || 'No error message',
              inline: false,
            },
          ],
          timestamp: notification.skippedAt.toISOString(),
          footer: {
            text: 'CDC Error Monitoring',
          },
        },
      ],
    };
  }

  /**
   * Build Discord webhook payload for batch notification
   */
  private buildBatchDiscordPayload(
    notifications: CdcErrorNotification[],
  ): object {
    const entitySummary = notifications.reduce(
      (acc, n) => {
        acc[n.entityType] = (acc[n.entityType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const summaryText = Object.entries(entitySummary)
      .map(([type, count]) => `${type}: ${count}`)
      .join('\n');

    return {
      username: 'CDC Alert Bot',
      embeds: [
        {
          title: `⚠️ ${notifications.length} CDC Records Skipped`,
          description:
            'Multiple CDC records have been skipped due to repeated processing failures.',
          color: 15158332, // Red color
          fields: [
            {
              name: 'Service',
              value: this.serviceName,
              inline: true,
            },
            {
              name: 'Total Skipped',
              value: notifications.length.toString(),
              inline: true,
            },
            {
              name: 'Entity Summary',
              value: summaryText || 'N/A',
              inline: false,
            },
            {
              name: 'Change IDs',
              value:
                notifications
                  .slice(0, 10)
                  .map((n) => n.changeId)
                  .join(', ') + (notifications.length > 10 ? '...' : ''),
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'CDC Error Monitoring',
          },
        },
      ],
    };
  }

  /**
   * Send webhook request
   */
  private async sendWebhook(payload: object): Promise<void> {
    if (!this.webhookUrl) {
      return;
    }

    await firstValueFrom(
      this.httpService.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }),
    );
  }

  /**
   * Check if notifications are enabled
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }
}
