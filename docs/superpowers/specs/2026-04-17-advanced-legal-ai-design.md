# Especificação de Design: IA Assistente Administrativa (Sprint 5)

**Data:** 17 de Abril de 2026
**Status:** Aprovado e Refatorado (Diretriz de Segurança Jurisdicional)
**Objetivo:** Implementar um assistente de IA focado estritamente na automação mecânica, organização e formatação de textos.

## 🚨 DIRETRIZ IMUTÁVEL DA PLATAFORMA
A Inteligência Artificial no InovaSys é estritamente proibida de atuar em atividades fim da jurisdição arbitral. A IA:
- **NÃO PODE** analisar provas ou anexos para encontrar "contradições".
- **NÃO PODE** sugerir decisões, fundamentações ou caminhos jurídicos.
- **NÃO PODE** atuar como "analista de mérito" ou "assessor jurídico".
A responsabilidade intelectual, decisória e analítica é **exclusiva** do árbitro humano e das partes envolvidas.

## 1. Escopo de Atuação da IA
- **Assistente de Digitação:** Formata o texto fornecido pelo árbitro (ex: adequação às normas ABNT, melhorias ortográficas e coesão).
- **Montagem de Minutas:** Puxa os metadados do processo (nomes, valores) e transcreve a fundamentação ditada/escrita pelo árbitro para um documento final em HTML.
- **Extração de Dados Mecânicos:** Lê dados públicos (como CPFs e Datas) de documentos para acelerar o preenchimento de cadastros no sistema.

## 2. Componentes de Interface
- `IAAssistantPanel.tsx`: Barra lateral com foco em formatação de textos avulsos e revisão ortográfica rápida.
- `SentenceGenerator.tsx`: Modal para digitação estruturada. O árbitro digita os fundamentos e o dispositivo, e o sistema devolve o documento PDF devidamente diagramado, sem alterar o mérito de nenhuma palavra inserida.

## 3. Segurança e Privacidade
- Modelos são orientados via _System Instruction_ para recusar terminantemente prompts que peçam análises de processos ou tomada de decisão, alertando o usuário sobre as regras da Câmara.
