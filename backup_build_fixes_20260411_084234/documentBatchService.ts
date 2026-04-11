import { PDFGenerator } from '../utils/pdfGenerator';
import JSZip from 'jszip';

export interface BatchJob {
  id: string;
  processIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  results: Array<{
    processId: string;
    success: boolean;
    filename?: string;
    blob?: Blob;
    error?: string;
  }>;
  createdAt: Date;
  completedAt?: Date;
}

export interface BatchOptions {
  concurrency?: number;
  templateType?: string;
  generateConsolidated?: boolean;
}

class DocumentBatchService {
  private activeJobs: Map<string, BatchJob> = new Map();

  async generateBatch(
    processos: any[],
    options: BatchOptions = {},
    onProgress?: (job: BatchJob) => void
  ): Promise<BatchJob> {
    const jobId = crypto.randomUUID();
    
    const job: BatchJob = {
      id: jobId,
      processIds: processos.map(p => p.id),
      status: 'running',
      progress: 0,
      total: processos.length,
      results: [],
      createdAt: new Date(),
    };

    this.activeJobs.set(jobId, job);
    onProgress?.(job);

    const concurrency = options.concurrency || 3;
    const results: BatchJob['results'] = [];

    // Processa em lotes com controle de concorrência
    for (let i = 0; i < processos.length; i += concurrency) {
      const batch = processos.slice(i, i + concurrency);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (processo) => {
          try {
            const blob = await PDFGenerator.generateProcessDocument(processo, options.templateType);
            return {
              processId: processo.id,
              success: true,
              filename: `processo_${processo.numero.replace(/\//g, '-')}.pdf`,
              blob,
            };
          } catch (error) {
            return {
              processId: processo.id,
              success: false,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
          }
        })
      );

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });

      job.progress = Math.min(100, Math.round(((i + batch.length) / processos.length) * 100));
      job.results = results;
      onProgress?.(job);
    }

    // Gerar relatório consolidado se solicitado
    if (options.generateConsolidated && results.filter(r => r.success).length > 0) {
      try {
        const successProcessos = processos.filter(p => 
          results.find(r => r.processId === p.id && r.success)
        );
        
        const consolidatedBlob = await PDFGenerator.generateConsolidatedReport(successProcessos);
        results.push({
          processId: 'consolidated',
          success: true,
          filename: 'relatorio_consolidado.pdf',
          blob: consolidatedBlob,
        });
      } catch (error) {
        console.warn('Não foi possível gerar relatório consolidado:', error);
      }
    }

    job.status = 'completed';
    job.progress = 100;
    job.results = results;
    job.completedAt = new Date();
    
    this.activeJobs.set(jobId, job);
    onProgress?.(job);

    return job;
  }

  async downloadAsZip(job: BatchJob): Promise<void> {
    const zip = new JSZip();
    
    const successResults = job.results.filter(r => r.success && r.blob);
    
    for (const result of successResults) {
      if (result.blob && result.filename) {
        const arrayBuffer = await result.blob.arrayBuffer();
        zip.file(result.filename, arrayBuffer);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const filename = `lote_documentos_${job.id.substring(0, 8)}.zip`;
    
    PDFGenerator.downloadBlob(zipBlob, filename);
  }

  getJob(jobId: string): BatchJob | undefined {
    return this.activeJobs.get(jobId);
  }

  clearJob(jobId: string): void {
    this.activeJobs.delete(jobId);
  }
}

export const documentBatchService = new DocumentBatchService();