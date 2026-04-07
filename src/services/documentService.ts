import { Masks } from '../utils/masks';

export const documentService = {
  visualizarDoc: (num: number, p: any, arb: any, cam: any, extraData: any = null) => {
    let html = "";
    
    // Helper to simulate mkEdit from legacy code
    const mkEdit = (value: string, fieldName: string) => `<span class="editable-field" data-field="${fieldName}" style="border-bottom: 1px dashed var(--color-accent); cursor: pointer;">${value}</span>`;

    let dia = new Date().getDate();
    let mes = new Date().toLocaleString('pt-BR', { month: 'long' });
    let ano = new Date().getFullYear();
    let hoje = new Date().toLocaleDateString('pt-BR');

    const logoHtml = cam.logo ? `<img src="${cam.logo}" height="80" style="max-height: 80px; width: auto; display: block; margin: 0 auto 15px auto;" alt="Logo" referrerpolicy="no-referrer" />` : '';
    const camEndereco = cam.endereco || 'Rua: Odilardo Silva, nº 304/B - Bairro Jesus de Nazaré; Macapá/AP - CEP 68.908-153';
    const camCidadeEstado = cam.cidade && cam.estado ? `${cam.cidade}/${cam.estado}` : 'Macapá/AP';
    const camPresidente = cam.presidente_nome || 'Sisaque Alicio de Souza Cardoso';

    const headerBlock = `
        <div style="text-align:center; margin-bottom:20px; border-bottom: 2px solid #000; padding-bottom: 10px; font-family: 'Arial', sans-serif;">
            ${logoHtml}
            <h3 style="margin:0; text-transform:uppercase; font-size: 16px; font-weight: bold;">${cam.nome || 'CAMCAP - CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO DO AMAPÁ'}</h3>
            <p style="margin:2px 0; font-size:12px; font-weight: bold;">CNPJ - ${cam.cnpj || '24.584.883/0001-92'}</p>
            <p style="margin:2px 0; font-size:11px;">Matriz: ${camEndereco}</p>
            <p style="margin:2px 0; font-size:11px;">Fone - ${cam.fone || '(96) 3242-4830'}</p>
        </div>
    `;

    if(num === 1) {
        html = `
        <div style="text-align:center; padding:20px; font-family: 'Arial', sans-serif; color: #000;">
            <h3 style="margin-bottom:40px; font-size: 22px;">PROCEDIMENTO N° ${p.numero_processo}</h3>
            
            <div style="margin: 40px 0;">
                ${logoHtml}
            </div>

            <h3 style="margin-top:20px; text-transform:uppercase; font-size: 16px;">${cam.nome || 'CAMCAP - CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO DO AMAPÁ'}</h3>
            
            <h4 style="margin-top:40px; text-decoration: underline; font-size: 18px; text-transform: uppercase; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 0;">
                DOCUMENTOS DO PROCESSO DE MEDIAÇÃO, CONCILIAÇÃO E ARBITRAGEM
            </h4>
            
            <div style="text-align:left; margin-top:40px;">
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0; font-weight: bold;">DEMANDANTE:</p>
                    <div style="border: 1px solid #000; padding: 10px; min-height: 20px; text-align: center; font-weight: bold; text-transform: uppercase; color: #d00;">
                        ${mkEdit(p.requerente_nome, 'requerente_nome')}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <p style="margin: 0; font-weight: bold;">DEMANDADO:</p>
                    <div style="border: 1px solid #000; padding: 10px; min-height: 20px; text-align: center; font-weight: bold; text-transform: uppercase; color: #d00;">
                        ${mkEdit(p.requerido_nome, 'requerido_nome')}
                    </div>
                </div>

                <div style="margin-top: 40px; border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold;">
                    DATA DA ENTRADA: <span style="color: #d00;">${new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>

            <div style="margin-top:60px; text-align:center;">
                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">REGISTRO DO PROCESSO</h2>
                <p style="text-align: justify; line-height: 1.5; font-size: 16px;">
                    No dia <span style="color: #d00;">${dia}</span> de <span style="color: #d00;">${mes}</span> do ano de ${ano}, nesta cidade de ${mkEdit(cam.cidade || 'Macapá', 'cam_cidade')}, nesta ${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO DO AMAPÁ'} fiz o presente registro deste processo.
                </p>
            </div>
        </div>`;
    }
    else if(num === 2) {
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.4; color: #000; padding: 10px;">
            ${headerBlock}

            <h4 style="text-align:center; font-weight: bold; margin: 20px 0; font-size: 16px;">
                TERMO DE APRESENTAÇÃO DO PEDIDO Nº ${p.numero_processo}, ${mkEdit(camCidadeEstado, 'cam_cidade_estado')}, ${hoje}.
            </h4>

            <p>Eu, abaixo identificado(a), como Requerente, solicito que o conflito descrito abaixo seja resolvido por meio de Mediação, Conciliação ou Arbitragem, em face da parte acionada, pelos motivos explicados a seguir:</p>

            <div style="background: #eee; border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; margin: 15px 0;">DEMANDANTE</div>
            <p style="margin: 5px 0;">
                <strong>Nome:</strong> <span style="color: #d00;">${mkEdit(p.requerente_nome, 'requerente_nome')}</span>, 
                ${mkEdit(`${p.requerente_nacionalidade || 'brasileiro'}, ${p.requerente_estado_civil || 'casado'}, Profissão: ${p.requerente_profissao || 'xxxxxx'}`, 'requerente_qualificacao')} 
                RG: ${mkEdit(p.requerente_rg || 'xxxxx/AP', 'requerente_rg')} e CPF: <span style="color: #d00;">${mkEdit(Masks.doc(p.requerente_doc), 'requerente_doc')}</span>, 
                residente e domiciliado no Município de ${mkEdit(p.requerente_cidade || cam.cidade || 'Macapá', 'requerente_cidade')}/${mkEdit(p.requerente_estado || cam.estado || 'AP', 'requerente_estado')}, à ${mkEdit(p.requerente_end, 'requerente_end')}. 
                <strong>Contato:</strong> ${mkEdit('(96) xxxxxxxx', 'requerente_fone')}
            </p>

            <div style="background: #eee; border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; margin: 15px 0;">DEMANDADO</div>
            <p style="margin: 5px 0;">
                <strong>Nome:</strong> <span style="color: #d00;">${mkEdit(p.requerido_nome, 'requerido_nome')}</span>, 
                ${mkEdit(`${p.requerido_nacionalidade || 'brasileiro'}, ${p.requerido_estado_civil || 'casado'}, Profissão: ${p.requerido_profissao || 'xxxxxx'}`, 'requerido_qualificacao')} 
                RG: ${mkEdit(p.requerido_rg || 'xxxxx/AP', 'requerido_rg')} e CPF: <span style="color: #d00;">${mkEdit(Masks.doc(p.requerido_doc), 'requerido_doc')}</span>, 
                residente e domiciliado no Município de ${mkEdit(p.requerido_cidade || cam.cidade || 'Macapá', 'requerido_cidade')}/${mkEdit(p.requerido_estado || cam.estado || 'AP', 'requerido_estado')}, à ${mkEdit(p.requerido_end, 'requerido_end')}. 
                <strong>Contato:</strong> ${mkEdit('(96) xxxxxxxx', 'requerido_fone')}
            </p>

            <div style="background: #eee; border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; margin: 15px 0;">DESCRIÇÃO DO QUE ACONTECEU E DO PEDIDO.</div>
            <p style="margin: 5px 0; white-space:pre-wrap; text-align: justify;">${mkEdit(p.resumo_fatos, 'resumo_fatos')}</p>

            <div style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; margin: 15px 0;">
                Valor da causa: <span style="color: #d00;">R$ ${Number(p.valor_causa ?? 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${mkEdit('valor por extenso', 'campo_livre_valor_extenso')})</span>.
            </div>

            <p style="font-size: 13px; text-align: justify;">Pelo que foi explicado acima, peço que esta <strong>${cam.nome || 'Câmara'}</strong> envie uma <strong>NOTIFICAÇÃO</strong> para a parte acionada. Isso serve para dar início ao processo de solução do conflito. Se a parte acionada comparecer à reunião (audiência) que será marcada, tentaremos chegar a um acordo amigável. Caso não haja acordo, seguiremos com o processo conforme as regras da Câmara e a Lei de Arbitragem (Lei 9.307/96). Eu me comprometo a entregar todos os documentos pedidos pela Câmara nos prazos definidos, sob pena de o processo ser cancelado.</p>

            <p><strong>AGENDADA PARA 1ª AUDIÊNCIA:</strong> <span style="color: #d00;">${mkEdit('04/07/2022', 'campo_livre_data_audiencia')} às ${mkEdit('15:00', 'campo_livre_hora_audiencia')} horas</span></p>

            <div style="margin-top:30px;">
                <p>Assinatura: _____________________________________________________________________</p>
                <p>Demandante: _____________________________________________________________________</p>
            </div>
        </div>`;
    }
    else if(num === 3) {
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.5; color: #000;">
            ${headerBlock}
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 5px;"></div>
                <p style="font-weight: bold; margin: 0;">Oficial Extrajudicial</p>
            </div>

            <h3 style="text-align:center; font-weight: bold; font-size: 20px; margin-bottom: 30px;">1ª NOTIFICAÇÃO EXTRAJUDICIAL</h3>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Requerido (a):</strong> ${mkEdit(p.requerido_nome, 'requerido_nome')}</p>
                <p><strong>Endereço:</strong> ${mkEdit(p.requerido_end, 'requerido_end')}</p>
                <p><strong>Contato:</strong> ${mkEdit('(96)_____________________', 'campo_livre_contato_req')}</p>
            </div>

            <p>Prezado (a) Senhor (a)</p>
            
            <p>Solicitamos o seu comparecimento no dia <strong>${mkEdit('15 de dezembro de 2022', 'campo_livre_data_extenso')} às ${mkEdit('15:00hs', 'campo_livre_hora_audiencia')}</strong>, na sala de reuniões da Câmara, no endereço: <strong>${cam.endereco || 'Rua: Odilardo Silva, nº 304B - Bairro Jesus de Nazaré; Macapá/AP'}</strong>. O objetivo é resolver o conflito de forma amigável e rápida, conforme a <strong>Lei Federal n. 9.307/96 (Lei de Arbitragem)</strong>.</p>
            
            <p><strong>Importante:</strong> Esta notificação informa que foi iniciado o <strong>PROCESSO Nº ${p.numero_processo}</strong>. O não comparecimento ou a falta de resposta pode trazer consequências previstas em lei e no regulamento da Câmara.</p>
            
            <p>Sem mais para o momento, colocamo-nos ao inteiro dispor para quaisquer esclarecimentos que se fizerem necessários.</p>
            
            <p style="text-align:right; margin-top:40px;">${mkEdit(camCidadeEstado, 'cam_cidade_estado')}, ${hoje}.</p>
            
            <div style="margin-top:60px;">
                <p>Recebido em ____ de__________ de ${ano} às ____:____</p>
                <div style="border-bottom: 1px solid #000; width: 400px; margin-top: 40px;"></div>
                <p style="font-weight: bold;">Demandado</p>
            </div>
        </div>`;
    }
    else if(num === 4) { 
        if(!arb) return "Vincule um árbitro primeiro."; 
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.6; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; margin: 30px 0;">PORTARIA ARBITRAL Nº ${mkEdit('000. xxx', 'campo_livre_portaria_num')}/${ano} - ${cam.nome || 'CAMCAP'}</h3>
            
            <p>O Presidente da ${cam.nome || 'CAMCAP'} - CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO DO AMAPÁ, usando de suas atribuições legais que lhes são conferidas através do Art.1º, III – DA DENOMINAÇÃO, SEDE E FINS, do Regimento Interno da Entidade.</p>
            
            <h4 style="font-weight: bold; margin-top: 20px;">RESOLVE:</h4>
            
            <p><strong>Art.1º NOMEAR</strong>, na forma do §3º do art. 260 do CPC/2015, e §4º do art.7º, artigos 13 e 19 da Lei 9.307/96, o <strong>Sr. <span style="color: #d00;">${arb.nome}</span></strong>, como <strong>Juiz Arbitral Ad hoc</strong> para atuar no Procedimento Arbitral de nº <span style="color: #d00;">${p.numero_processo}</span>, constando como partes <span style="color: #d00;">a Sra. ${p.requerente_nome} e o Sra. ${p.requerido_nome}</span>, para, sob compromisso, desempenhar a função de <strong>Juiz Arbitral no Ato da Arbitragem</strong> supramencionada, ficando à disposição para todos os atos praticados no referido Procedimento Arbitral até o encerramento deste.</p>
            
            <p><strong>Art.2º</strong> Esta Portaria entra em vigor na data de sua publicação.</p>
            
            <p style="text-align:right; margin-top:40px;">${mkEdit(camCidadeEstado, 'cam_cidade_estado')}, <span style="color: #d00;">${hoje}</span>.</p>
            
            <div style="margin-top:80px; text-align:center;">
                <p style="font-weight: bold; margin: 0;">${mkEdit(camPresidente, 'cam_presidente')}</p>
                <p style="margin: 0;">Presidente da ${cam.nome || 'CAMCAP'}</p>
            </div>
        </div>`; 
    }
    else if(num === 5) { 
        if(!arb) return "Vincule um árbitro primeiro."; 
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.5; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; text-decoration: underline; margin: 30px 0; font-size: 22px;">TERMO DE COMPROMISSO</h3>
            
            <p>Aos <span style="color: #d00;">${dia}</span> dias do mês de <span style="color: #d00;">${mes}</span> do ano de ${ano}, na forma do §3º do art. 260 do CPC/2015, perante o <strong>Sr. ${mkEdit(camPresidente, 'cam_presidente')}, Árbitro-Presidente</strong> da ${cam.nome || 'CAMCAP'} compareceram de comum acordo com o Sr. <strong><span style="color: #d00;">${arb.nome}</span></strong>, ${mkEdit(`${arb.nacionalidade || 'brasileiro'}, ${arb.estado_civil || 'casado'} RG ${arb.rg || 'xxxxxxxx'} e CPF ${arb.cpf || 'xxxxxxxxxxxxx'}`, 'arb_qualificacao')}, domiciliado a ${mkEdit(arb.endereco_profissional || arb.endereco || 'Rua Odilardo Silva Nº 304/B', 'arb_end')}, para formalmente assumir a função de Árbitro, junto ao Procedimento Arbitral de nº <strong><span style="color: #d00;">${p.numero_processo}</span></strong>, constando como parte <span style="color: #d00;">a Sra. ${p.requerente_nome} e o Sra. ${p.requerido_nome}</span>, ocasião em que presta o compromisso do fiel cumprimento das tarefas que lhes foram confiadas, bem como, o de zelar pela guarda dos documentos, manuseio dos autos, peças e quaisquer outros que porventura venham a ser juntados ao mesmo, ficando ainda, ciente o Árbitro, de que deverá seguir as normas estabelecidas pelos Princípios instituídos na Lei Federal nº. 9.307/96, alterada pela Lei nº 13.129/2015 e Princípios Constitucionais da Ampla Defesa e do Contraditório, da Igualdade das Partes, da Imparcialidade do Árbitro e de seu Livre Convencimento e Confidencialidade do Procedimento Arbitral, bem como, demais leis correlatas. Devendo cumprir determinações da Presidência desta Câmara, bem como, do seu Código de Ética, onde lhe é dado ciência dos impedimentos e suspeição estabelecidos em Lei, o que o (a) torna legalmente habilitado (a) ao exercício das atribuições aqui delegadas. Do que, para constar, lavro o Presente Termo, ao final assinado pelo Árbitro nomeado.</p>
            
            <p style="text-align:right; margin-top:40px;">${mkEdit(camCidadeEstado, 'cam_cidade_estado')}, <span style="color: #d00;">${dia} de ${mes}</span> de ${ano}.</p>
            
            <div style="margin-top:80px; text-align:center;">
                <div style="border-bottom: 1px solid #000; width: 400px; margin: 0 auto 5px;"></div>
                <p style="font-weight: bold; margin: 0; color: #d00;">${arb.nome}</p>
                <p style="font-weight: bold; margin: 0;">Árbitro - Ad hoc</p>
            </div>
        </div>`; 
    }
    else if(num === 6) { 
        if(!arb) return "Vincule um árbitro primeiro."; 
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.4; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; text-decoration: underline; margin: 20px 0;">TERMO DE COMPROMISSO ARBITRAL</h3>
            
            <p>Procedimento n° <span style="color: #d00;">${p.numero_processo}</span></p>
            <p>Pelo presente instrumento particular, as partes abaixo qualificadas firmam Compromisso Arbitral.</p>
            
            <p><strong>1. Dados das Partes:</strong></p>
            
            <p><strong>1.1. DEMANDANTE:</strong></p>
            <p><strong>Nome:</strong> <span style="color: #d00;">${mkEdit(p.requerente_nome, 'requerente_nome')}</span>, ${mkEdit('brasileiro, casado, Profissão: professora', 'campo_livre_req_qualificacao')} RG: ${mkEdit('xxxxx/AP', 'campo_livre_req_rg')} e CPF: <span style="color: #d00;">${mkEdit(Masks.doc(p.requerente_doc), 'requerente_doc')}</span>, residente e domiciliado no Município de Macapá/AP, à ${mkEdit(p.requerente_end, 'requerente_end')}. <strong>Contato:</strong> (96) <span style="color: #d00;">${mkEdit('xxxxxxxx', 'campo_livre_req_fone')}</span></p>
            
            <p><strong>1.2. DEMANDADO:</strong></p>
            <p><strong>Nome:</strong> <span style="color: #d00;">${mkEdit(p.requerido_nome, 'requerido_nome')}</span>, ${mkEdit('brasileiro, casado, Profissão: xxxxxx', 'campo_livre_reqd_qualificacao')} RG: ${mkEdit('xxxxx/AP', 'campo_livre_reqd_rg')} e CPF: <span style="color: #d00;">${mkEdit(Masks.doc(p.requerido_doc), 'requerido_doc')}</span>, residente e domiciliado no Município de Macapá/AP, à ${mkEdit(p.requerido_end, 'requerido_end')}. <strong>Contato:</strong> (96) <span style="color: #d00;">${mkEdit('xxxxxxxx', 'campo_livre_reqd_fone')}</span></p>
            
            <p><strong>2. Motivo do Processo:</strong></p>
            <p style="white-space: pre-wrap;">${mkEdit(p.resumo_fatos, 'resumo_fatos')}</p>
            
            <p><strong>3. Estimativa do Pedido:</strong></p>
            <p>3.1 – O valor de <span style="color: #d00;">R$ ${Number(p.valor_causa ?? 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${mkEdit('quatrocentos reais', 'campo_livre_valor_extenso')})</span>.</p>
            
            <p><strong>4. Do Árbitro:</strong></p>
            <p>4.1 – De comum acordo, as partes que compõem o presente Compromisso Arbitral, escolhem como Árbitro (s) o (s) senhor (ES). <strong><span style="color: #d00;">${mkEdit('GAMALIEL ALICIO DE SOUZA CARDOSO', 'campo_livre_arb_nome')}</span></strong>, Bacharel em Teologia, residente e domiciliado nesta cidade de, Macapá/AP, e ficam cientes de sua ABSOLUTA RESPONSABILIDADE ante esse feito, em acordo ao que prescreve as leis do país, estando cientes, por serem MAIORES E CAPAZES e por isso, outorgam plenos poderes à Câmara de Arbitragem, Mediação e Conciliação do Amapá-CAMCAP, com Sede provisória na Rua: Odilardo Silva, nº 304/B - Bairro Jesus de Nazaré, CEP 68.908-153 na Cidade de Macapá/AP, onde será proferida a Sentença para esse Procedimento.</p>
            
            <p><strong>5. Meio de Notificação dos Atos Procedimentais:</strong></p>
            <p>5.1. Parte 1 ( ) carta ( ) e-mail: (x) WhatsApp ( ) Telefone</p>
            
            <p><strong>6. Cláusulas do Compromisso Arbitral:</strong></p>
            <p style="font-size: 11px;">6.1 - A Sentença Arbitral será apresentada em 10 (dez) dias... 6.2 – As partes qualificadas neste Termo... 6.5 – Os honorários dos árbitros serão fixados no presente Termo, no percentual de 20% (vinte por cento) ao Demandante.</p>
            
            <p style="text-align:right; margin-top:20px;">Macapá/AP, <span style="color: #d00;">${mkEdit('04 de julho', 'campo_livre_data_extenso')}</span> de ${ano}.</p>
            
            <div style="margin-top:30px; border-top: 1px solid #000; padding-top: 10px;">
                <p>Demandante: _________________________________________________________________</p>
                <p>Demandado: __________________________________________________________________</p>
                <p>Árbitro Ad-hoc: ________________________________________________________________</p>
            </div>
        </div>`; 
    }
    else if(num === 7) { 
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.4; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; margin: 20px 0;">ATA DA AUDIÊNCIA DO PROCEDIMENTO ARBITRAL nº <span style="color: #d00;">${p.numero_processo}</span></h3>
            
            <p>Realizada aos <span style="color: #d00;">${mkEdit('quatro', 'campo_livre_dia_extenso')}</span> dias do mês de <span style="color: #d00;">${mes}</span> do ano de ${ano}, nesta cidade de Macapá/AP, na Rua Odilardo Silva, 304/B, Bairro Jesus de Nazaré, iniciada às <span style="color: #d00;">${mkEdit('15h00', 'campo_livre_hora')}</span>, presente como <strong>DEMANDANTE: <span style="color: #d00;">${p.requerente_nome}</span></strong> e como <strong>DEMANDADO: <span style="color: #d00;">${p.requerido_nome}</span></strong>. Como <strong>JUIZ ARBITRAL Dr. <span style="color: #d00;">${mkEdit('GAMALIEL ALICIO DE SOUZA CARDOSO', 'campo_livre_arb_nome')}</span></strong>.</p>
            
            <h4 style="font-weight: bold; margin-top: 15px;">TERMO DE AUDIÊNCIA:</h4>
            <p style="white-space: pre-wrap; font-size: 13px;">${extraData?.texto_ata || 'As partes declaram a intenção de Homologar o referido acordo...'}</p>
            
            <h4 style="font-weight: bold; margin-top: 15px;">RELATORIO:</h4>
            <p style="font-size: 13px;">No dia ${new Date(p.created_at).toLocaleDateString('pt-BR')}, o Demandante procurou esta Câmara...</p>
            
            <h4 style="font-weight: bold; margin-top: 15px;">SENTENÇA HOMOLOGATORIA ARBITRAL:</h4>
            <p style="font-size: 13px;">Diante do desejo das partes em formalizar a homologação de um acordo entre as partes, após a assinatura do compromisso arbitral elegendo a presente Câmara...</p>
            
            <p style="font-size: 11px; margin-top: 10px;">Lei Nº 9.307/96 - Lei da Arbitragem - Art. 18. O árbitro é juiz de fato e de direito, e a sentença que proferir não fica sujeita a recurso ou a homologação pelo Poder Judiciário.</p>
            
            <div style="margin-top:40px; text-align:center; border-top: 1px solid #000; padding-top: 20px;">
                <p>________________________________________________</p>
                <p style="font-weight: bold; margin: 0;">${mkEdit('GAMALIEL ALICIO DE SOUZA CARDOSO', 'campo_livre_arb_nome')}</p>
                <p style="margin: 0;">Juiz Arbitral</p>
                
                <p style="margin-top: 20px;">________________________________________________</p>
                <p style="font-weight: bold; margin: 0;">${p.requerente_nome}</p>
                <p style="margin: 0;">Demandante</p>
            </div>
        </div>`; 
    }
    else if(num === 8) { 
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.4; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; margin: 20px 0; font-size: 20px;">SENTENÇA ARBITRAL.</h3>
            <p style="font-weight: bold;">Processo Arbitral, nº ${p.numero_processo}.</p>
            
            <h4 style="font-weight: bold; margin-top: 20px;">I- DO RELATÓRIO:</h4>
            <p><strong>Demandante:</strong> ${p.requerente_nome}, ${mkEdit('brasileiro, união estável, Profissão: funcionário público', 'campo_livre_req_qualificacao')} RG: ${mkEdit('011885 - AP', 'campo_livre_req_rg')} e CPF: ${Masks.doc(p.requerente_doc)}, residente e domiciliado no Município de Macapá/AP.</p>
            <p><strong>Demandado:</strong> ${p.requerido_nome}, ${mkEdit('brasileiro, casada, Profissão: Autônomo', 'campo_livre_reqd_qualificacao')} RG: ${mkEdit('080248 /AP', 'campo_livre_reqd_rg')} e CPF: ${Masks.doc(p.requerido_doc)}, residente e domiciliado no Município de Macapá/AP.</p>
            
            <h4 style="font-weight: bold; margin-top: 20px;">II – DOS FUNDAMENTOS DA DECISÃO</h4>
            <p style="white-space: pre-wrap; font-size: 13px;">${extraData?.texto_sentenca || 'A presente arbitragem encontra-se na Lei 9.307, de 23 de setembro de 1996...'}</p>
            
            <h4 style="font-weight: bold; margin-top: 20px;">III – Dispositivo:</h4>
            <p style="font-size: 13px;">Após análise dos fatos e diante da vontade das partes exercidas neste procedimento, cabe ao Magistrado no exercício dos seus deveres processuais assumidos... Isto posto, tenho por bem em <strong>CONDENAR</strong> o Demandado...</p>
            
            <p style="text-align:right; margin-top:40px;">Macapá/AP, <span style="color: #d00;">${hoje}</span>.</p>
            
            <div style="margin-top:60px; text-align:center;">
                <div style="border-bottom: 1px solid #000; width: 400px; margin: 0 auto 5px;"></div>
                <p style="font-weight: bold; margin: 0;">${mkEdit('GAMALIEL ALICIO DE SOUZA CARDOSO', 'campo_livre_arb_nome')}</p>
                <p style="margin: 0;">Árbitro Ad-hoc</p>
            </div>
        </div>`; 
    }
    else if(num === 9) {
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.5; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; margin: 30px 0;">TERMO DE RECEBIMENTO DE SENTENÇA ARBITRAL</h3>
            
            <p>Conforme o que preceitua o <strong>artigo 29 da Lei 9.307/96</strong> - Proferida a sentença arbitral, dá-se por finda a arbitragem, devendo o árbitro, ou o presidente do tribunal arbitral, enviar cópia da decisão às partes... Certifica que nesta data, foi entregue uma via original da <strong>SENTENÇA ÁRBITRAL nº ${p.numero_processo}</strong>, sendo as partes a Sra. <span style="color: #d00;">${p.requerente_nome}</span> e o Sr. <span style="color: #d00;">${p.requerido_nome}</span>.</p>
            
            <p>Do que para constar lavro o presente Termo e devidamente cientificada pelo Árbitro Ad-Hoc e escrevente.</p>
            
            <p style="text-align:right; margin-top:40px;">Macapá/AP <span style="color: #d00;">${hoje}</span></p>
            
            <div style="margin-top:60px; text-align:center; border-top: 1px solid #000; padding-top: 20px;">
                <p style="font-weight: bold; margin: 0;">${mkEdit('GAMALIEL ALICIO DE SOUZA CARDOSO', 'campo_livre_arb_nome')}</p>
                <p style="margin: 0;">Juiz Arbitral - Ad hoc</p>
                
                <p style="margin-top: 30px; font-weight: bold; margin-bottom: 0;">${p.requerente_nome}</p>
                <p style="margin: 0;">Demandante</p>
            </div>
        </div>`;
    }
    else if(num === 10 && extraData) { 
        let strData = String(extraData.dataPagamento); 
        let dataPag = (strData !== 'null' && strData !== 'undefined' && strData !== '') ? new Date(strData + 'T00:00:00').toLocaleDateString('pt-BR') : mkEdit('__/__/____', 'campo_livre_data'); 
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.4; color: #000;">
            ${headerBlock}
            <h3 style="text-align:center; font-weight: bold; text-decoration: underline; margin: 20px 0;">RECIBO DE VALORES DE ACORDO</h3>
            
            <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                <p>Data: ____/_____/${ano}</p>
                <p>Recibo de Pagamento nº: ${extraData.num || '_____'}</p>
            </div>
            
            <p>EU, <strong><span style="color: #d00;">${p.requerente_nome}</span></strong>, ${mkEdit('brasileira, casada, Profissão: XXXXX', 'campo_livre_req_qualificacao')} RG: ${mkEdit('XXXXX/AP', 'campo_livre_req_rg')} e CPF: <span style="color: #d00;">${Masks.doc(p.requerente_doc)}</span>, residente e domiciliado no Município de Macapá/AP, à ${p.requerente_end}. <strong>RECEBEU</strong> do(a) Sr(a). <strong><span style="color: #d00;">${p.requerido_nome}</span></strong>, ${mkEdit('brasileira, casada, Profissão: XXXXX', 'campo_livre_reqd_qualificacao')} RG: ${mkEdit('XXXXX/AP', 'campo_livre_reqd_rg')} e CPF: <span style="color: #d00;">${Masks.doc(p.requerido_doc)}</span>.</p>
            
            <p>O Valor de <strong>R$ <span style="color: #d00;">${Number(extraData.valor ?? 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${mkEdit('valor por extenso', 'campo_livre_valor_extenso')})</span></strong>, referente à parcela de pagamento acordado entre as partes mediante Cláusula ${mkEdit('13', 'campo_livre_clausula')} do TERMO DE ACORDO com Sentença Arbitral do processo Nº <span style="color: #d00;">${p.numero_processo}</span>.</p>
            
            <p style="margin-top:20px;"><strong>Forma de pagamento:</strong> (x) Dinheiro ( ) Cheque ( ) Cartão ( ) Transferência Bancaria</p>
            
            <div style="margin-top:60px; text-align:center;">
                <div style="border-bottom: 1px solid #000; width: 400px; margin: 0 auto 5px;"></div>
                <p style="font-weight: bold; margin: 0; color: #d00;">${p.requerente_nome}</p>
                <p style="font-weight: bold; margin: 0;">Demandante</p>
            </div>
        </div>`; 
    }
    else if(num === 11) {
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.6; color: #000;">
            ${headerBlock}
            
            <h3 style="text-align:center; font-weight: bold; text-decoration: underline; margin: 30px 0;">RECIBO DE HONORÁRIOS DA CÂMARA ARBITRAL</h3>
            
            <p style="text-indent: 0; margin-bottom: 20px;">
                <strong>${cam.nome || 'CAMCAP - CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO DO AMAPÁ'}</strong>, 
                localizada na ${mkEdit(cam.endereco || 'Av. Ana Nery, nº 304/B, Bairro: Jesus de Nazaré Macapá/AP', 'campo_livre_cam_end')} - CNPJ ${cam.cnpj || '24.584.883/0001-92'}. 
                <strong>Recebeu</strong> de <strong><span style="color: #d00;">${mkEdit(p.requerente_nome, 'requerente_nome')}</span></strong>, 
                ${mkEdit('brasileiro, profissão, estado civil, RG e CPF', 'campo_livre_req_qualificacao')}, 
                residente e domiciliado na ${mkEdit(p.requerente_end, 'requerente_end')}.
            </p>

            <p style="text-indent: 0; margin-bottom: 20px;">
                O valor de <strong>R$ <span style="color: #d00;">${Number((p.valor_causa ?? 0) * 0.1).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${mkEdit('valor por extenso', 'campo_livre_valor_extenso')})</span></strong>, 
                referente ao pagamento dos <strong>Honorários Arbitrais da ${cam.nome || 'CAMCAP'}</strong>.
            </p>

            <p>Sem mais e para que esta seja interpretada como verdadeira, firmo.</p>
            
            <p style="text-align:right; margin-top: 40px;">${mkEdit('Macapá/AP', 'campo_livre_cidade')}, ${hoje}</p>
            
            <div style="margin-top:80px; text-align:center;">
                <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 5px;"></div>
                <p style="font-weight: bold; margin: 0;">DIRETOR FINANCEIRO</p>
            </div>
        </div>`;
    }
    else if(num === 12) {
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: justify; line-height: 1.6; color: #000;">
            <div style="text-align:center; margin-bottom:30px;">
                ${logoHtml}
                <h3 style="margin:10px 0; text-transform:uppercase; font-weight: bold; text-decoration: underline;">REQUERIMENTO</h3>
            </div>

            <p style="margin-bottom: 20px;">
                À <strong>${cam.nome || 'CAMCAP – Câmara de Arbitragem, Mediação e Conciliação do Amapá'}</strong> - 
                CNPJ – ${cam.cnpj || '24.584.883/0001-92'}, Matriz: ${cam.endereco || 'Rua: Odilardo Silva, nº 304B– Bairro Jesus de Nazaré; Macapá/AP – CEP 68.908-153'}
            </p>

            <p style="margin-bottom: 20px;">
                <strong><span style="color: #d00;">${mkEdit(p.requerido_nome, 'requerido_nome')}</span></strong>, 
                ${mkEdit('brasileira, solteira, RG: 515696 - AP e CPF: 013.864.772-06', 'campo_livre_reqd_qualificacao')}, 
                residente e domiciliada na cidade de ${mkEdit('Macapá/AP', 'campo_livre_reqd_cidade')}, à ${mkEdit(p.requerido_end, 'requerido_end')}.
            </p>

            <p style="margin-bottom: 20px;">
                Eu <strong><span style="color: #d00;">${p.requerido_nome}</span></strong> solicito a esta Câmara que: 
                ${mkEdit('por motivo de estar passando por situação financeira difícil, não poderei da à parcela do mês julho com foi acordado, e só poderei dar no dia 12 de agosto de 2022.', 'campo_livre_requerimento')}
            </p>

            <p>Solicita aprovação,</p>
            
            <p style="text-align:right; margin-top: 40px;">${mkEdit('Macapá/AP', 'campo_livre_cidade')}, ${hoje}</p>
            
            <div style="margin-top:60px; space-y-12">
                <div style="margin-bottom: 40px;">
                    <p style="margin-bottom: 5px;">Assinatura da demandada: ________________________________________</p>
                </div>
                <div>
                    <p>Assinatura do Árbitro: _____________________________________________</p>
                </div>
            </div>
        </div>`;
    }
    else if(num === 13) {
        html = `
        <div style="font-family: 'Arial', sans-serif; text-align: center; color: #000; position: relative; min-height: 1000px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="margin-bottom: 50px;">
                    ${logoHtml}
                </div>
                
                <h1 style="margin: 40px 0; font-size: 64px; font-weight: bold; letter-spacing: 5px;">ANEXO</h1>
                
                <h2 style="margin-top: 40px; font-size: 48px; font-weight: bold; text-transform: uppercase;">DEMANDANTE</h2>
            </div>
            
            <div style="padding-bottom: 40px; font-size: 14px;">
                ${mkEdit(cam.endereco || 'Av: Ana Nery, nº 304-B – Bairro: Jesus de Nazaré.', 'campo_livre_cam_end')}
            </div>

            <div style="page-break-before: always;"></div>
            
            <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="margin-bottom: 50px;">
                    ${logoHtml}
                </div>
                
                <h1 style="margin: 40px 0; font-size: 64px; font-weight: bold; letter-spacing: 5px;">ANEXO</h1>
                
                <h2 style="margin-top: 40px; font-size: 48px; font-weight: bold; text-transform: uppercase;">DEMANDADO</h2>
            </div>

            <div style="padding-bottom: 40px; font-size: 14px;">
                ${mkEdit(cam.endereco || 'Av: Ana Nery, nº 304-B – Bairro: Jesus de Nazaré.', 'campo_livre_cam_end')}
            </div>
        </div>`;
    }
    
    return html;
  }
};
