exports.seed = knex => {
  return knex('banco').del()
    .then(() => {
      return knex('banco').insert([
        { codigo: 104, nome: 'Caixa Econômica Federal' },
        { codigo: 107, nome: 'Banco BBM S/A' },
        { codigo: 121, nome: 'Banco Agiplan S.A' },
        { codigo: 136, nome: 'Unicred - Unicred Oeste Catarinense' },
        { codigo: 151, nome: 'Banco Nossa Caixa S.A.' },
        { codigo: 197, nome: 'Stone Pagamentos S.A' },
        { codigo: 208, nome: 'Banco UBS Pactual S.A.' },
        { codigo: 212, nome: 'Banco Original' },
        { codigo: 213, nome: 'Banco Arbi S.A.' },
        { codigo: 214, nome: 'Banco Dibens S.A.' },
        { codigo: 217, nome: 'Banco John Deere S.A.' },
        { codigo: 218, nome: 'Banco Bonsucesso S.A.' },
        { codigo: 222, nome: 'Banco Calyon Brasil S.A.' },
        { codigo: 224, nome: 'Banco Fibra S.A.' },
        { codigo: 225, nome: 'Banco Brascan S.A.' },
        { codigo: 229, nome: 'Banco Cruzeiro do Sul S.A.' },
        { codigo: 230, nome: 'Unicard Banco Múltiplo S.A.' },
        { codigo: 233, nome: 'Banco GE Capital S.A.' },
        { codigo: 237, nome: 'Banco Bradesco S.A.' },
        { codigo: 241, nome: 'Banco Classico S.A.' },
        { codigo: 243, nome: 'Banco Máxima S.A.' },
        { codigo: 246, nome: 'Banco ABC Brasil S.A.' },
        { codigo: 248, nome: 'Banco Boavista Interatlantico S.A.' },
        { codigo: 249, nome: 'Banco Investcred Unibanco S.A.' },
        { codigo: 250, nome: 'Banco Schahin S.A.' },
        { codigo: 254, nome: 'Paraná Banco S.A.' },
        { codigo: 260, nome: 'NU Pagamentos S.A.' },
        { codigo: 263, nome: 'Banco Cacique S.A' },
        { codigo: 265, nome: 'Banco Fator S.A.' },
        { codigo: 266, nome: 'Banco Cedula S.A.' },
        { codigo: 300, nome: 'Banco de La Nacion Argentina' },
        { codigo: 318, nome: 'Banco BMG S.A.' },
        { codigo: 341, nome: 'Banco Itaú S.A.' },
        { codigo: 356, nome: 'Banco ABN AMRO Real S.A' },
        { codigo: 366, nome: 'Banco Societe General e Brasil S.A' },
        { codigo: 370, nome: 'Banco Westlb do Brasil S.A.' },
        { codigo: 376, nome: 'Banco J.P. Morgan S.A.' },
        { codigo: 389, nome: 'Banco Mercantil do Brasil S.A.' },
        { codigo: 394, nome: 'Banco Finasa BMC S.A.' },
        { codigo: 399, nome: 'HSBC Bank Brasil S.A. - Banco Multiplo' },
        { codigo: 409, nome: 'Unibanco - Uniao de Bancos Brasileiros S.A.' },
        { codigo: 412, nome: 'Banco Capital S.A.' },
        { codigo: 422, nome: 'Banco Safra S.A.' },
        { codigo: 453, nome: 'Banco Rural S.A.' },
        { codigo: 456, nome: 'Banco de Tokyo - Mitsubishi UFJ Brasil S/A' },
        { codigo: 464, nome: 'Banco Sumitomo Mitsui Brasileiro S.A.' },
        { codigo: 473, nome: 'Banco Caixa Geral - Brasil S.A.' },
        { codigo: 477, nome: 'Citibank N.A.' },
        { codigo: 487, nome: 'Deutsche Bank S.A. - Banco Alemão' },
        { codigo: 488, nome: 'JP Morgan Chase Bank, National Association' },
        { codigo: 492, nome: 'ING Bank N.V.' },
        { codigo: 494, nome: 'Banco de La Republica Oriental del Uruguay' },
        { codigo: 495, nome: 'Banco de La Provinia de Buenos Aires' },
        { codigo: 505, nome: 'Banco Credit Suisse (Brasil) S.A.' },
        { codigo: 582, nome: 'Unicred União' },
        { codigo: 600, nome: 'Banco Luso Brasileiro S.A.' },
        { codigo: 604, nome: 'Banco Industrial do Brasil S.A.' },
        { codigo: 610, nome: 'Banco VR S.A.' },
        { codigo: 611, nome: 'Banco Paulista S.A.' },
        { codigo: 612, nome: 'Banco Guanabara S.A.' },
        { codigo: 613, nome: 'Banco Pecunia S.A.' },
        { codigo: 623, nome: 'Banco Panamericano S.A.' },
        { codigo: 626, nome: 'Banco Ficsa S.A.' },
        { codigo: 630, nome: 'Banco Intercap S.A.' },
        { codigo: 633, nome: 'Banco Rendimento S.A.' },
        { codigo: 634, nome: 'Banco Triangulo S.A.' },
        { codigo: 637, nome: 'Banco Sofisa S.A.' },
        { codigo: 638, nome: 'Banco Prosper S.A.' },
        { codigo: 643, nome: 'Banco Pine S.A.' },
        { codigo: 653, nome: 'Banco Indusval S.A.' },
        { codigo: 654, nome: 'Banco A.J. Renner S.A.' },
        { codigo: 655, nome: 'Banco Votorantim S.A.' },
        { codigo: 707, nome: 'Banco Daycoval S.A.'  },
        { codigo: 719, nome: 'BANIF - Banco Internacional do Funchal (Brasil), S.A.' },
        { codigo: 721, nome: 'Banco Credibel S.A.' },
        { codigo: 734, nome: 'Banco Gerdau S.A.' },
        { codigo: 738, nome: 'Banco Morada S.A.' },
        { codigo: 739, nome: 'Banco BGN S.A.' },
        { codigo: 740, nome: 'Banco Barclays S.A.' },
        { codigo: 741, nome: 'Banco Ribeirao Preto S.A.' },
        { codigo: 743, nome: 'Banco Emblema S.A.' },
        { codigo: 745, nome: 'Banco Citibank S.A.' },
        { codigo: 746, nome: 'Banco Modal S.A.' },
        { codigo: 747, nome: 'Banco Rabobank International Brasil S.A.' },
        { codigo: 748, nome: 'Banco Cooperativo Sicredi S.A.' },
        { codigo: 749, nome: 'Banco Simples S.A.' },
        { codigo: 751, nome: 'Dresdner Bank Brasil S.A. Banco Multiplo' },
        { codigo: 752, nome: 'Banco BNP Paribas Brasil S.A.' },
        { codigo: 753, nome: 'NBC Bank Brasil S.A. - Banco Múltiplo' },
        { codigo: 756, nome: 'Banco Cooperativo do Brasil S.A. - Bancoob' },
        { codigo: 757, nome: 'Banco Keb do Brasil S.A.' },
        { codigo: 1, nome: 'Banco do Brasil S.A.' },
        { codigo: 3, nome: 'Banco da Amazonia S.A.' },
        { codigo: 4, nome: 'Banco do Nordeste do Brasil S.A.' },
        { codigo: 19, nome: 'Banco Azteca do Brasil S.A.' },
        { codigo: 21, nome: 'Banestes S.A. Banco do Estado do Espirito Santo' },
        { codigo: 25, nome: 'Banco Alfa S.A.' },
        { codigo: 33, nome: 'Banco Santander Banespa S.A.' },
        { codigo: 37, nome: 'Banco do Estado do Pará S.A.' },
        { codigo: 36, nome: 'Banco Bradesco BBI S/A' },
        { codigo: 40, nome: 'Banco Cargill S.A.' },
        { codigo: 41, nome: 'Banco do Estado do Rio Grande do Sul S.A.' },
        { codigo: 44, nome: 'Banco BVA S.A.' },
        { codigo: 45, nome: 'Banco Opportunity S.A.' },
        { codigo: 47, nome: 'Banco do Estado de Sergipe S.A.' },
        { codigo: 62, nome: 'Hipercard Banco Múltiplo S.A.' },
        { codigo: 63, nome: 'Banco IBI S.A. - Banco Múltiplo' },
        { codigo: 65, nome: 'Banco Lemon S.A.' },
        { codigo: 66, nome: 'Banco Morgan Stanley S.A.' },
        { codigo: 69, nome: 'BPN Brasil Banco Múltiplo S.A.'},
        { codigo: 70, nome: 'BRB - Banco de Brasilia S.A.' },
        { codigo: 72, nome: 'Banco Rural Mais S.A.' },
        { codigo: 73, nome: 'BB Banco Popular do Brasil S.A.' },
        { codigo: 74, nome: 'Banco J. Safra S.A.' },
        { codigo: 75, nome: 'Banco CR2 S/A' },
        { codigo: 76, nome: 'Banco KDB do Brasil S.A.' },
        { codigo: 77, nome: 'Banco Intermedium S/A' },
        { codigo: 79, nome: 'JBS Banco S/A' },
        { codigo: 81, nome: 'Concórdia Banco S.A.' },
        { codigo: 84, nome: 'Banco Uniprime Norte do Parana' },
        { codigo: 85, nome: 'CECRED - Cooperativa Central de Crédito Urbano' },
        { codigo: 89, nome: 'CREDISAN - Cooperativa de Crédito Rural de Região da Mogiana' },
        { codigo: 96, nome: 'Banco BM&F de Serviços de Liquidação e Custódia S.A.' },
        { codigo: 99, nome: 'Cooperativa de Crédito Uniprime Central' }
      ]);
    });
};