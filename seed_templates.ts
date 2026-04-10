// Nota: Como não posso importar o documentService diretamente aqui por causa das dependências de browser/react,
// vou extrair os templates principais para o seeding via script SQL ou rodando manualmente via console se necessário.
// Por simplicidade imediata, vou preparar o SQL de seeding.

const templates = [
  { tipo: 1, nome: '01 - CAPA DO PROCESSO' },
  { tipo: 2, nome: '02 - TERMO DE APRESENTAÇÃO DO PEDIDO' },
  { tipo: 3, nome: '03 - NOTIFICAÇÃO EXTRAJUDICIAL' },
  { tipo: 4, nome: '04 - PORTARIA ARBITRAL (NOMEAÇÃO)' },
  { tipo: 5, nome: '05 - TERMO DE COMPROMISSO DO ÁRBITRO' },
  { tipo: 6, nome: '06 - TERMO DE COMPROMISSO ARBITRAL' },
  { tipo: 7, nome: '07 - ATA DE AUDIÊNCIA ARBITRAL' },
  { tipo: 8, nome: '08 - SENTENÇA ARBITRAL' },
  { tipo: 9, nome: '09 - TERMO DE RECEBIMENTO DE SENTENÇA' },
  { tipo: 10, nome: '10 - RECIBO DE VALORES DE ACORDO' },
  { tipo: 11, nome: '11 - RECIBO DE HONORÁRIOS' },
  { tipo: 12, nome: '12 - REQUERIMENTO' },
  { tipo: 13, nome: '13 - ANEXO DE PROCESSO' }
];

console.log("Para carregar os templates, execute o SQL gerado com o conteúdo do documentService.");
