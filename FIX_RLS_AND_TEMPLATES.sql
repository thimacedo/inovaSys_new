-- ==========================================================
-- INOVASYS - CORREÇÕES ADICIONAIS DE RLS E TEMPLATES
-- ==========================================================

-- 1. Garantir que Árbitros possam ATUALIZAR os processos para os quais foram designados
-- Isso é necessário para mudar status e adicionar andamentos que afetem a tabela de processos
DROP POLICY IF EXISTS "Árbitros podem atualizar seus processos" ON public.processos;
CREATE POLICY "Árbitros podem atualizar seus processos" ON public.processos
  FOR UPDATE
  USING (
    (get_user_role() = 'arbitro' AND arbitro_id = auth.uid()) OR
    (get_user_role() IN ('gestor', 'admin', 'god'))
  )
  WITH CHECK (
    (get_user_role() = 'arbitro' AND arbitro_id = auth.uid()) OR
    (get_user_role() IN ('gestor', 'admin', 'god'))
  );

-- 2. Garantir que as aspas nos nomes das políticas de templates estejam corretas
DROP POLICY IF EXISTS "Templates visíveis por todos da organização" ON templates_documentos;
CREATE POLICY "Templates visíveis por todos da organização" ON templates_documentos
    FOR SELECT USING (true);

-- 3. Garantir que o SEED de templates tenha conteúdo útil para testes
-- Atualizando o Template 2 (Termo de Arbitragem) com placeholders reais
UPDATE templates_documentos 
SET conteudo_html = '<div style="text-align: center;">
    <h1>TERMO DE ARBITRAGEM</h1>
    <p>PROCESSO Nº: <strong>{numero_processo}</strong></p>
</div>
<br/>
<p><strong>REQUERENTE:</strong> {requerente_nome} (Doc: {requerente_doc})</p>
<p><strong>REQUERIDO:</strong> {requerido_nome} (Doc: {requerido_doc})</p>
<br/>
<p><strong>ÁRBITRO DESIGNADO:</strong> {arbitro_nome}</p>
<p><strong>CÂMARA:</strong> {camara_nome}</p>
<br/>
<h3>RESUMO DOS FATOS:</h3>
<p>{resumo_fatos}</p>
<br/>
<p>As partes elegem a Câmara {camara_nome} para dirimir o presente conflito, conforme as regras estabelecidas no regulamento interno.</p>
<br/><br/>
<p style="text-align: right;">Data: {data_hoje}</p>
<br/><br/>
<div style="display: flex; justify-content: space-around; margin-top: 50px;">
    <div style="border-top: 1px solid black; width: 200px; text-align: center;">Assinatura Requerente</div>
    <div style="border-top: 1px solid black; width: 200px; text-align: center;">Assinatura Requerido</div>
</div>'
WHERE tipo_documento = 2;
