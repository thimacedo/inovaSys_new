import { useState, useCallback, useRef } from 'react';
import { documentBatchService, BatchJob, BatchOptions } from '../services/documentBatchService';

export function useDocumentBatch() {
  const [job, setJob] = useState<BatchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (processos: any[], options: BatchOptions = {}) => {
    setLoading(true);
    
    try {
      const result = await documentBatchService.generateBatch(
        processos,
        options,
        (updatedJob) => {
          setJob({ ...updatedJob });
        }
      );
      
      setJob(result);
      return result;
    } catch (error) {
      console.error('Erro na geração em lote:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadZip = useCallback(async () => {
    if (!job) return;
    await documentBatchService.downloadAsZip(job);
  }, [job]);

  const reset = useCallback(() => {
    if (job?.id) {
      documentBatchService.clearJob(job.id);
    }
    setJob(null);
    setLoading(false);
  }, [job]);

  const successCount = job?.results.filter(r => r.success).length || 0;
  const errorCount = job?.results.filter(r => !r.success).length || 0;

  return {
    job,
    loading,
    generate,
    downloadZip,
    reset,
    successCount,
    errorCount,
    isRunning: job?.status === 'running',
    isCompleted: job?.status === 'completed',
  };
}