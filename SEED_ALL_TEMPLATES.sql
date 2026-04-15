-- ==========================================================
-- INOVASYS - SEED DE TODOS OS TEMPLATES LEGAIS (v2.0)
-- Migração completa dos 13 templates do app.js legado para o Banco de Dados
-- ==========================================================

DELETE FROM templates_documentos;

INSERT INTO templates_documentos (nome, tipo_documento, conteudo_html)
VALUES 
(
    'Autuação', 1, 
    '<div style="text-align:center; padding:20px; font-family: ''Times New Roman'', serif;">
        <h3 style="margin-bottom:5px;">PROCEDIMENTO N° {numero_processo}</h3>
        <h4 style="margin-top:0;">JUSTIÇA PRIVADA<br>{camara_nome}</h4>
        <p style="font-weight:bold; margin-top:20px;">LEI 9.307/1996</p>
        <h3 style="margin-top:20px; text-transform:uppercase;">{camara_nome}</h3>
        <h4 style="margin-top:20px; text-decoration: underline;">AUTOS DE PROCESSO DE MEDIAÇÃO, CONCILIAÇÃO E ARBITRAGEM</h4>
        <div style="text-align:left; margin-top:50px; padding-left: 10%;">
            <p><strong>DEMANDANTE:</strong><br>{requerente_nome}</p>
            <p style="margin-top:20px;"><strong>DEMANDADO:</strong><br>{requerido_nome}</p>
            <p style="margin-top:20px;"><strong>DATA DA ENTRADA:</strong> {data_entrada}</p>
        </div>
        <div style="margin-top:50px; text-align:justify;">
            <h4 style="text-align:center;">AUTUAÇÃO</h4>
            <p>No dia {dia} de {mes} do ano de {ano}, nesta cidade de {cidade}, nesta {camara_nome}, fiz a presente autuação dos presentes autos.</p>
        </div>
    </div>'
),
(
    'Termo de Apresentação do Pedido', 2,
    '<div style="font-family: ''Times New Roman'', serif; text-align: justify; line-height: 1.6;">
        <div style="text-align:center; margin-bottom:20px;">
            <h3 style="margin:0; text-transform:uppercase;">{camara_nome}</h3>
            <p style="margin:0; font-size:12px;">CNPJ: {camara_cnpj}</p>
            <p style="margin:0; font-size:12px;">Endereço: {camara_endereco} | Fone: {camara_fone}</p>
        </div>
        <h4 style="text-align:center; text-decoration:underline;">TERMO DE APRESENTAÇÃO DO PEDIDO N° {numero_processo}</h4>
        <p style="text-align:right;">{local_data}</p>
        <p>Eu, abaixo qualificado(a), na qualidade de Demandante, venho mui respeitosamente, requerer que seja objeto de Mediação, Conciliação e/ou Arbitragem, o litígio descrito abaixo, em face do demandado abaixo qualificado...</p>
        <h4 style="margin-bottom:5px;">DEMANDANTE</h4>
        <p><strong>Nome:</strong> {requerente_nome}, <strong>CPF/CNPJ:</strong> {requerente_doc}, residente e domiciliado(a) à {requerente_end}.</p>
        <h4 style="margin-bottom:5px;">DEMANDADO</h4>
        <p><strong>Nome:</strong> {requerido_nome}, <strong>CPF/CNPJ:</strong> {requerido_doc}, residente e domiciliado(a) à {requerido_end}.</p>
        <h4 style="margin-bottom:5px;">DESCRIÇÃO DO FATO, DO OBJETO E DO PEDIDO</h4>
        <p style="white-space:pre-wrap;">{resumo_fatos}</p>
        <p><strong>Valor da causa:</strong> {valor_causa}</p>
        <div style="margin-top:60px; text-align:center;">
            ___________________________________________________<br>
            <strong>{requerente_nome}</strong><br>
            Demandante
        </div>
    </div>'
),
(
    '1ª Notificação Extrajudicial', 3,
    '<div style="font-family: ''Times New Roman'', serif; text-align: justify; line-height: 1.6;">
        <div style="text-align:center; margin-bottom:20px;">
            <h3 style="margin:0; text-transform:uppercase;">{camara_nome}</h3>
            <p style="margin:0; font-size:12px;">CNPJ: {camara_cnpj}</p>
            <p style="margin:0; font-size:12px;">Endereço: {camara_endereco} | Fone: {camara_fone}</p>
        </div>
        <h3 style="text-align:center; text-decoration:underline;">1ª NOTIFICAÇÃO EXTRAJUDICIAL</h3>
        <p><strong>Requerido(a):</strong> {requerido_nome}</p>
        <p><strong>Endereço:</strong> {requerido_end}</p>
        <br>
        <p>Prezado(a) Senhor(a), solicitamos o comparecimento de Vossa Senhoria no próximo dia <strong>{data_audiencia}</strong>...</p>
        <p style="text-align:right; margin-top:40px;">{local_data}</p>
        <div style="margin-top:60px; text-align:center;">___________________________________________________<br><strong>Oficial Extrajudicial</strong></div>
    </div>'
),
(
    'Portaria de Nomeação', 4,
    '<div style="font-family: ''Times New Roman'', serif;">
        <h3>PORTARIA DE NOMEAÇÃO N° {numero_processo}</h3>
        <p>O Presidente da {camara_nome}, RESOLVE:</p>
        <p>NOMEAR o Sr(a) <strong>{arbitro_nome}</strong> para atuar como Juiz Arbitral no processo.</p>
        <div style="margin-top:60px; text-align:center;">_________________________________<br>Presidente</div>
    </div>'
),
(
    'Termo de Compromisso do Árbitro', 5,
    '<div style="font-family: ''Times New Roman'', serif;">
        <h3>TERMO DE COMPROMISSO DO ÁRBITRO</h3>
        <p>O Sr(a) <strong>{arbitro_nome}</strong> assume formalmente a função de Árbitro no Procedimento n° {numero_processo}.</p>
        <div style="margin-top:60px; text-align:center;">_________________________________<br><strong>{arbitro_nome}</strong><br>Árbitro</div>
    </div>'
),
(
    'Termo de Compromisso Arbitral', 6,
    '<div style="font-family: ''Times New Roman'', serif;">
        <h3>TERMO DE COMPROMISSO ARBITRAL</h3>
        <p>Pelo presente instrumento, {requerente_nome} e {requerido_nome} elegem a {camara_nome} e o árbitro <strong>{arbitro_nome}</strong> para dirimir o litígio do processo {numero_processo}.</p>
        <div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;">
            <div>___________________________<br>Requerente</div>
            <div>___________________________<br>Requerido</div>
        </div>
    </div>'
),
(
    'Ata de Audiência', 7,
    '<div style="font-family: ''Times New Roman'', serif;">
        <h3>ATA DE AUDIÊNCIA N° {numero_processo}</h3>
        <p>Aos {local_data}, realizou-se audiência referente ao processo.</p>
        <h4>RELATO E TERMOS:</h4>
        <p style="white-space: pre-wrap; text-align:justify;">{ata_texto}</p>
        <div style="margin-top:60px; text-align:center;">_________________________________<br>Árbitro / Partes</div>
    </div>'
),
(
    'Sentença Arbitral', 8,
    '<div style="font-family: ''Times New Roman'', serif; text-align: justify; line-height: 1.6;">
        <div style="text-align:center; margin-bottom:20px;">
            <h3 style="margin:0; text-transform:uppercase;">{camara_nome}</h3>
            <h3 style="text-align:center; text-decoration:underline;">SENTENÇA ARBITRAL - PROCESSO {numero_processo}</h3>
        </div>
        <p><strong>Partes:</strong> {requerente_nome} e {requerido_nome}.</p>
        <h4>FUNDAMENTAÇÃO E DISPOSITIVO:</h4>
        <p style="white-space: pre-wrap; text-align:justify;">{sentenca_texto}</p>
        <div style="margin-top:60px; text-align:center;">_________________________________<br><strong>{arbitro_nome}</strong><br>Juiz Arbitral</div>
    </div>'
),
(
    'Termo de Entrega de Documentos', 9,
    '<div style="font-family: ''Times New Roman'', serif;">
        <h3>TERMO DE ENTREGA DE DOCUMENTOS</h3>
        <p>Declaramos para os devidos fins que as partes receberam cópia da Sentença Arbitral proferida no processo {numero_processo}.</p>
        <div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;">
            <div>___________________________<br>Requerente</div>
            <div>___________________________<br>Requerido</div>
        </div>
    </div>'
),
(
    'Recibo de Acordo', 10,
    '<div style="font-family: ''Times New Roman'', serif; text-align: justify;">
        <h3 style="text-align:center; text-decoration:underline;">RECIBO DE VALORES DE ACORDO</h3>
        <p>EU, <strong>{requerente_nome}</strong>, recebi do(a) Sr(a). <strong>{requerido_nome}</strong> o valor de <strong>{valor_pago}</strong> referente ao processo {numero_processo}.</p>
        <div style="margin-top:60px; text-align:center;">___________________________________________________<br><strong>{requerente_nome}</strong><br>Recebedor</div>
    </div>'
),
(
    'Recibo de Honorários', 11,
    '<div style="font-family: ''Times New Roman'', serif; text-align: justify;">
        <h3 style="text-align:center; text-decoration:underline;">RECIBO DE HONORÁRIOS DA CÂMARA ARBITRAL</h3>
        <p>A <strong>{camara_nome}</strong> recebeu de <strong>{requerente_nome}</strong> o valor de <strong>{valor_honorarios}</strong>.</p>
        <div style="margin-top:60px; text-align:center;">___________________________________________________<br><strong>DIRETOR FINANCEIRO</strong></div>
    </div>'
);
