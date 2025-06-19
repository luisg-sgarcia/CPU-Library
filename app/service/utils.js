function loadSelectOptions(selectId, apiEndpoint, selectedValue = null) {
    const selectElement = $(`#${selectId}`);
    selectElement.find('option:not([disabled]):not(:selected)').remove(); // Remove opções existentes (exceto a disabled)

    $.ajax({
        url: `http://localhost:3000/${apiEndpoint}`,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            data.forEach(item => {
                const option = `<option value="${item.nome}">${item.nome}</option>`;
                selectElement.append(option);
            });
            
            if (selectedValue) {
                selectElement.val(selectedValue);
            }
            selectElement.formSelect(); // Materialize precisa ser re-inicializado para selects dinâmicos
            
        },
        error: function(xhr, status, error) {
            console.error(`Erro ao carregar opções para ${selectId} de ${apiEndpoint}:`, error);
            M.toast({html: `Erro ao carregar opções de ${selectId}.`, classes: 'red darken-2'});
        }
    });
}