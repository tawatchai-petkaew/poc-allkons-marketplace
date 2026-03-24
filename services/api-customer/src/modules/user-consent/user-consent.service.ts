import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveUserConsentDto } from './dto/save-user-consent.dto';
import { SaveUserConsentResponseDto } from './dto/save-user-consent-response.dto';
import { User } from '@/model/user.entity';
import { UserConsent } from '@/model/user-consent.entity';
import { ConsentMessage } from '@/model/consent-message.entity';
import axios from 'axios';

@Injectable()
export class UserConsentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserConsent)
    private readonly userConsentRepository: Repository<UserConsent>,
    @InjectRepository(ConsentMessage)
    private readonly consentMessageRepository: Repository<ConsentMessage>,
  ) {}

  async saveUserConsent(
    saveUserConsentDto: SaveUserConsentDto,
  ): Promise<SaveUserConsentResponseDto> {
    const { phoneNumber, consentIds, akIdConsentIds, tokenAllkonsId } =
      saveUserConsentDto;

    // Validate input
    if (!phoneNumber || phoneNumber.trim() === '') {
      throw new BadRequestException('Phone number is required');
    }

    if (!consentIds || consentIds.length === 0) {
      throw new BadRequestException('At least one consent ID is required');
    }

    // Find user by phone number
    const user = await this.userRepository.findOne({
      where: { tel: phoneNumber.trim() },
    });

    if (!user) {
      throw new NotFoundException(
        `User with phone number ${phoneNumber} not found`,
      );
    }

    // Validate consent message IDs exist
    const consentMessages = await this.consentMessageRepository.findByIds(
      consentIds,
    );

    if (consentMessages.length !== consentIds.length) {
      const foundIds = consentMessages.map((cm) => cm.id);
      const missingIds = consentIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Consent messages with IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Save user consents
    const savedConsents = [];
    const skippedConsents = [];

    for (const consentMessage of consentMessages) {
      // Check if consent already exists
      const existingConsent = await this.userConsentRepository.findOne({
        where: {
          userId: user.id,
          consentMessageId: consentMessage.id,
        },
      });

      if (!existingConsent) {
        const userConsent = this.userConsentRepository.create({
          userId: user.id,
          consentMessageId: consentMessage.id,
          acceptedAt: new Date(),
        });

        const saved = await this.userConsentRepository.save(userConsent);

        // Load with relations for response
        const savedWithRelations = await this.userConsentRepository.findOne({
          where: { id: saved.id },
          relations: ['consentMessage'],
        });

        savedConsents.push(savedWithRelations);
      } else {
        // Keep track of skipped consents for logging
        skippedConsents.push(consentMessage.id);
      }
    }

    // Log if some consents were skipped
    if (skippedConsents.length > 0) {
      console.log(
        `User ${
          user.id
        } already has consents for message IDs: ${skippedConsents.join(', ')}`,
      );
    }
    if (tokenAllkonsId && akIdConsentIds?.length > 0) {
      await this.createUserConsentAllkonsId(akIdConsentIds, tokenAllkonsId);
    }
    return SaveUserConsentResponseDto.create(savedConsents);
  }

  async findUserConsentByUserId(userId: number): Promise<UserConsent[]> {
    const userConsents = await this.userConsentRepository.find({
      where: { userId },
      relations: ['consentMessage'],
    });
    return userConsents;
  }

  async deleteUserConsentByIds(consentIds: number[]) {
    await this.userConsentRepository.delete(consentIds);
  }

  async deleteUserConsentById(consentId: number) {
    await this.userConsentRepository.delete(consentId);
  }

  async createUserConsentAllkonsId(
    akIdConsentIds: string[],
    token: string,
  ): Promise<UserConsent> {
    try {
      const url = process.env.ALLKONS_ID_API_URL;
      const payload = {
        consentDocuments: akIdConsentIds.map((id) => ({
          consentDocumentId: id,
          consentUserStatus: 'Approve',
        })),
      };
      const headers = {
        'app-id': process.env.CONSENT_MESSAGE_APP_ID,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(
        `${url}/consent/consent-account-update`,
        payload,
        { headers },
      );

      return response.data;
    } catch (error) {
      console.error('Error creating user consent for AllkonsId:', error);
      throw new BadRequestException(
        'Failed to create user consent for AllkonsId',
      );
    }
  }
}
