import { SupabaseClientFactory } from '../database/SupabaseClientFactory';
import { UserRepository } from '../database/repositories/UserRepository';
import { ProcessRepository } from '../database/repositories/ProcessRepository';
import { CamaraRepository } from '../database/repositories/CamaraRepository';
import { FinanceiroRepository } from '../database/repositories/FinanceiroRepository';
import { NotificationRepository } from '../database/repositories/NotificationRepository';
import { TemplateRepository } from '../database/repositories/TemplateRepository';
import { AttachmentRepository } from '../database/repositories/AttachmentRepository';
import { TeamRepository } from '../database/repositories/TeamRepository';
import { AuditRepository } from '../database/repositories/AuditRepository';
import { GetUserByEmailUseCase } from '../../core/usecases/GetUserByEmailUseCase';

export class DependencyRegistry {
  private static userRepository: UserRepository | null = null;
  private static processRepository: ProcessRepository | null = null;
  private static camaraRepository: CamaraRepository | null = null;
  private static financeiroRepository: FinanceiroRepository | null = null;
  private static notificationRepository: NotificationRepository | null = null;
  private static templateRepository: TemplateRepository | null = null;
  private static attachmentRepository: AttachmentRepository | null = null;
  private static teamRepository: TeamRepository | null = null;
  private static auditRepository: AuditRepository | null = null;

  public static getUserRepository(): UserRepository {
    if (!this.userRepository) this.userRepository = new UserRepository(SupabaseClientFactory.createBrowser());
    return this.userRepository;
  }

  public static getProcessRepository(): ProcessRepository {
    if (!this.processRepository) this.processRepository = new ProcessRepository(SupabaseClientFactory.createBrowser());
    return this.processRepository;
  }

  public static getCamaraRepository(): CamaraRepository {
    if (!this.camaraRepository) this.camaraRepository = new CamaraRepository(SupabaseClientFactory.createBrowser());
    return this.camaraRepository;
  }

  public static getFinanceiroRepository(): FinanceiroRepository {
    if (!this.financeiroRepository) this.financeiroRepository = new FinanceiroRepository(SupabaseClientFactory.createBrowser());
    return this.financeiroRepository;
  }

  public static getNotificationRepository(): NotificationRepository {
    if (!this.notificationRepository) this.notificationRepository = new NotificationRepository(SupabaseClientFactory.createBrowser());
    return this.notificationRepository;
  }

  public static getTemplateRepository(): TemplateRepository {
    if (!this.templateRepository) this.templateRepository = new TemplateRepository(SupabaseClientFactory.createBrowser());
    return this.templateRepository;
  }

  public static getAttachmentRepository(): AttachmentRepository {
    if (!this.attachmentRepository) {
      this.attachmentRepository = new AttachmentRepository(SupabaseClientFactory.createBrowser());
    }
    return this.attachmentRepository;
  }

  public static getTeamRepository(): TeamRepository {
    if (!this.teamRepository) {
      this.teamRepository = new TeamRepository(SupabaseClientFactory.createBrowser());
    }
    return this.teamRepository;
  }

  public static getAuditRepository(): AuditRepository {
    if (!this.auditRepository) {
      this.auditRepository = new AuditRepository(SupabaseClientFactory.createBrowser());
    }
    return this.auditRepository;
  }

  public static getGetUserByEmailUseCase(): GetUserByEmailUseCase {
    return new GetUserByEmailUseCase(this.getUserRepository());
  }
}
