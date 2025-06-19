document.addEventListener('DOMContentLoaded', function() {
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    const processorId = getUrlParameter('id');
    const processorDetailsContent = document.getElementById('processor-details-content');
    const loadingMessage = document.getElementById('loading-message');
    const detailModelo = document.getElementById('detail-modelo');

    if (processorId) {
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        $.ajax({
            url: `http://localhost:3000/processadores/${processorId}`,
            method: 'GET',
            dataType: 'json',
            success: function(processor) {
                if (processor) {
                    detailModelo.textContent = processor.modelo || 'Processador Desconhecido';
                    processorDetailsContent.innerHTML = `
                        <div class="col s12 m6 detail-item"><strong>Marca:</strong> ${processor.marca || 'N/A'}</div>
                        <div class="col s12 m6 detail-item"><strong>Frequência:</strong> ${processor.frequencia || 'N/A'}</div>
                        <div class="col s12 m6 detail-item"><strong>Núcleos:</strong> ${processor.nucleos || 'N/A'}</div>
                        <div class="col s12 m6 detail-item"><strong>Threads:</strong> ${processor.threads || 'N/A'}</div>
                        <div class="col s12 m6 detail-item"><strong>Socket:</strong> ${processor.socket || 'N/A'}</div>
                        ${processor.cacheL3 ? `<div class="col s12 m6 detail-item"><strong>Cache L3:</strong> ${processor.cacheL3}</div>` : ''}
                        ${processor.tdp ? `<div class="col s12 m6 detail-item"><strong>TDP:</strong> ${processor.tdp}</div>` : ''}
                        ${processor.litografia_nm ? `<div class="col s12 m6 detail-item"><strong>Litografia:</strong> ${processor.litografia_nm}</div>` : ''}
                        ${processor.ram_tipo ? `<div class="col s12 m6 detail-item"><strong>RAM Tipo:</strong> ${processor.ram_tipo}</div>` : ''}
                        ${processor.ram_velocidade_max ? `<div class="col s12 m6 detail-item"><strong>RAM Veloc. Máx.:</strong> ${processor.ram_velocidade_max}</div>` : ''}
                        ${processor.ram_capacidade_max ? `<div class="col s12 m6 detail-item"><strong>RAM Cap. Máx.:</strong> ${processor.ram_capacidade_max}</div>` : ''}
                        ${processor.graficos_integrados ? `<div class="col s12 m6 detail-item"><strong>Gráficos Integrados:</strong> ${processor.graficos_integrados}</div>` : ''}
                        ${processor.data_lancamento ? `<div class="col s12 m6 detail-item"><strong>Lançamento:</strong> ${processor.data_lancamento}</div>` : ''}
                        ${processor.pcie_versao ? `<div class="col s12 m6 detail-item"><strong>PCIe Versão:</strong> ${processor.pcie_versao}</div>` : ''}
                        ${processor.pcie_pistas ? `<div class="col s12 m6 detail-item"><strong>PCIe Pistas:</strong> ${processor.pcie_pistas}</div>` : ''}
                        ${processor.tecnologias && processor.tecnologias.length > 0 ? `<div class="col s12 detail-item"><strong>Tecnologias:</strong> ${processor.tecnologias.join(', ')}</div>` : ''}
                    `;
                } else {
                    detailModelo.textContent = 'Processador Não Encontrado';
                    processorDetailsContent.innerHTML = `<p class="center-align red-text">O processador com ID ${processorId} não foi encontrado.</p>`;
                }
            },
            error: function(xhr, status, error) {
                console.error(`Erro ao carregar detalhes do processador ${processorId}:`, error);
                detailModelo.textContent = 'Erro ao Carregar Detalhes';
                processorDetailsContent.innerHTML = `<p class="center-align red-text">Erro ao carregar os detalhes do processador. Tente novamente ou verifique o ID.</p>`;
                M.toast({html: 'Erro ao carregar detalhes do processador.', classes: 'red darken-2'});
            }
        });
    } else {
        detailModelo.textContent = 'ID do Processador Ausente';
        processorDetailsContent.innerHTML = `<p class="center-align red-text">Nenhum ID de processador foi fornecido na URL.</p>`;
    }
});