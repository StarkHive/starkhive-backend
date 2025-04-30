import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository, Between } from 'typeorm';
import {
  PolicyViolation,
  ViolationStatus,
  ViolationSeverity,
} from '../policy-violation/policy-violation.entity';
import { UserConsent } from '../user-censent/user-censent.entity';
import { Policy } from '../policy/policy.entity';

@Injectable()
export class PolicyReportingService {
  constructor(
    @InjectRepository(PolicyViolation)
    private policyViolationRepository: Repository<PolicyViolation>,
    @InjectRepository(UserConsent)
    private userConsentRepository: Repository<UserConsent>,
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  async getViolationsByPolicy(
    policyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PolicyViolation[]> {
    const where: any = { policyId };

    if (startDate && endDate) {
      where.detectedAt = Between(startDate, endDate);
    }

    return this.policyViolationRepository.find({
      where,
      order: { detectedAt: 'DESC' },
    });
  }

  async getViolationsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PolicyViolation[]> {
    const where: any = { userId };

    if (startDate && endDate) {
      where.detectedAt = Between(startDate, endDate);
    }

    return this.policyViolationRepository.find({
      where,
      relations: ['policy'],
      order: { detectedAt: 'DESC' },
    });
  }

  async getViolationsBySeverity(
    severity: ViolationSeverity,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PolicyViolation[]> {
    const where: any = { severity };

    if (startDate && endDate) {
      where.detectedAt = Between(startDate, endDate);
    }

    return this.policyViolationRepository.find({
      where,
      relations: ['policy'],
      order: { detectedAt: 'DESC' },
    });
  }

  async getConsentRateByPolicy(
    policyId: string,
  ): Promise<{ rate: number; total: number; consented: number }> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId },
    });

    if (!policy) {
      throw new Error(`Policy with ID ${policyId} not found`);
    }

    // Get the total number of users who have interacted with this policy
    const totalConsents = await this.userConsentRepository.count({
      where: { policyId },
    });

    // Get the number of users who have consented
    const consentedUsers = await this.userConsentRepository.count({
      where: { policyId, hasConsented: true },
    });

    const rate = totalConsents > 0 ? (consentedUsers / totalConsents) * 100 : 0;

    return {
      rate,
      total: totalConsents,
      consented: consentedUsers,
    };
  }

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    // Get all policies
    const policies = await this.policyRepository.find();

    const report = {
      generatedAt: new Date(),
      period: { startDate, endDate },
      policies: [],
    };

    for (const policy of policies) {
      // Get consent statistics
      const consentStats = await this.getConsentRateByPolicy(policy.id);

      // Get violation statistics
      const violations = await this.getViolationsByPolicy(
        policy.id,
        startDate,
        endDate,
      );

      const violationsBySeverity = {
        [ViolationSeverity.LOW]: violations.filter(
          (v) => v.severity === ViolationSeverity.LOW,
        ).length,
        [ViolationSeverity.MEDIUM]: violations.filter(
          (v) => v.severity === ViolationSeverity.MEDIUM,
        ).length,
        [ViolationSeverity.HIGH]: violations.filter(
          (v) => v.severity === ViolationSeverity.HIGH,
        ).length,
        [ViolationSeverity.CRITICAL]: violations.filter(
          (v) => v.severity === ViolationSeverity.CRITICAL,
        ).length,
      };

      const violationsByStatus = {
        [ViolationStatus.DETECTED]: violations.filter(
          (v) => v.status === ViolationStatus.DETECTED,
        ).length,
        [ViolationStatus.REVIEWING]: violations.filter(
          (v) => v.status === ViolationStatus.REVIEWING,
        ).length,
        [ViolationStatus.CONFIRMED]: violations.filter(
          (v) => v.status === ViolationStatus.CONFIRMED,
        ).length,
        [ViolationStatus.RESOLVED]: violations.filter(
          (v) => v.status === ViolationStatus.RESOLVED,
        ).length,
        [ViolationStatus.DISMISSED]: violations.filter(
          (v) => v.status === ViolationStatus.DISMISSED,
        ).length,
      };
    }

    return report;
  }
}
