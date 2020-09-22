const {
    FRONT_END_URL
} = process.env;

const sharedFunctions = require('./functions');

const TAXA_ALUGAVEL = 13;
const NO_REPLY_EMAIL = 'noreply@placeet.com';

const USUARIO_STATUS = {
    WAITING: 'waiting',
    APPROVED: 'approved',
    DISAPPROVED: 'disapproved'
};

const ALUGAVEL_STATUS = {
    WAITING: 'waiting',
    APPROVED: 'approved',
    DISAPPROVED: 'disapproved',
    REMOVED: 'removed'
};

const ALUGUEL_STATUS = {
    CREATED: 'created',
    ACTIVE: 'active',
    CANCELED: 'canceled'
};

const EMAILS_USUARIO = {
    SIGIN: {
        email: (user) => {
            return `
            Oi ${user.nome} ${user.sobrenome}
    
            Seja bem vindo a Placeet!
            Uma plataforma inovadora capaz de integrar negócios e pessoas.
            
            Clique no link abaixo para confirmar seu email:
            
            ${FRONT_END_URL}/confirm-email?token=${user.email_token}
            
            Caso você não tenha criado conta na Placeet e está recebendo este email por engano, por favor ignore-o.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: 'Confirme seu email'
    },
    RESET_PASSWORD: {
        email: (user, senha) => {
            return `Caro(a) ${user.nome} ${user.sobrenome},
        
            Você solicitou a recuperação de sua senha de acesso a nossa plataforma.
            
            Essa é a sua nova senha: ${senha}
            
            Utilize-a para logar e trocar por uma nova no menu "Login e Segurança".
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Recuperar senha"
    },
    ON_APPROVED: {
        email: (user) => {
            return `
            Olá ${user.nome} ${user.sobrenome}
            
            Seu cadastro em nossa plataforma foi aprovado com sucesso.
            
            Explore nosso ambiente, faça seu primeiro contrato ou cadastre o seu espaço.

            Temos a certeza que o(a) ajudaremos a encontrar o melhor negócio.

            Para mais informações entre em contato conosco diretamente pela plataforma.
            Caso você não tenha criado conta na Placeet e está recebendo este email por engano, por favor ignore-o.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Cadastro aprovado"
    },
    ON_REPROVED: {
        email: (user, comment) => {
            return `
            Olá ${user.nome} ${user.sobrenome}
            
            Seu cadastro na plataforma Placeet foi reprovado em nossa análise.
            
            O(s) motivo(s) que nos levaram a reprová-lo: ${comment}
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.

            Caso você não tenha criado conta na Placeet e está recebendo este email por engano, por favor ignore-o.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Cadastro reprovado"
    }
}

const EMAILS_ANUNCIO = {
    ON_APPROVED: {
        email: (user, anuncio) => {
            return`
            Oi ${user.nome} ${user.sobrenome}

            É bom tê-lo por aqui.

            Seu anúncio foi aprovado e está disponível para visualização em:

            https://placeet.com/spaces/${anuncio.id}
            
            Abraços,
            
            Equipe Placeet`
        },
        subject: "Anúncio aprovado"
    },
    ON_REPROVED: {
        email: (user, anuncio, comment) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Algumas informações/dados estão faltando em seu cadastro o que nos leva a reprovar seu(s) anúncio(s).

            O(s) motivo(s) está(ão) relatado(s) aqui: ${comment}
            
            Pedimos a gentileza que o(s) corrija(m) para que possamos validá-lo(s) e publicar o quanto antes.

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Anúncio reprovado"
    }
}

const  EMAILS_CONTRATO = {
    ON_PAYED_FOR_LOCATARIO: {
        email: (user, espaco, aluguel, dias_reservados) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Recebemos o seu pagamento referente a reserva do espaço: ${espaco.titulo}
            
            Valor total do contrato: R$ ${aluguel.valor}
            Período: ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} - ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Pagamento efetuado com sucesso"
    },
    ON_PAYED_FOR_LOCADOR: {
        email: (user, espaco, aluguel, dias_reservados) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Você recebeu uma nova solicitação de reserva para o espaço: ${espaco}. Acesse seu painel de locações e revise os detalhes da solicitação.
            
            Valor total do contrato: R$ ${aluguel.valor}
            Período: ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} - ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Nova solicitação de reserva"
    },
    ON_PAYED_FOR_ADMIN: {
        email: (espaco, aluguel, dias_reservados) => {
            return `
            Uma nova solicitação de reserva foi paga para o espaço: ${espaco.titulo}.

            Valor do contrato: R$ ${aluguel.valor}
            Período: ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} - ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.

            Abraços,

            Equipe Placeet`;
        },
        subject: "Nova reserva foi paga"
    },
    ON_ACCEPT_FOR_LOCATARIO: {
        email: (user, espaco, dias_reservados) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Sua reserva do espaço: ${espaco.titulo} foi aceita pelo locador.
            Ela inicia ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} e finaliza ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Reserva aceita"
    },
    ON_ACCEPT_FOR_LOCADOR: {
        email: (user, espaco, dias_reservados) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Parabéns pelo contrato de reserva do espaço: ${espaco.titulo}. Ele inicia dia ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} e vai até o dia ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}

            Certifique-se de deixar o local em ordem e com todos os requisitos do anúncio em ordem. Essa pequena tarefa melhorará a avaliação do seu espaço e gerará, em breve, novas locações.

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.

            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Contrato realizado"
    },
    ON_ACCEPT_FOR_ADMIN: {
        email: (locador, locatario, aluguel, espaco, dias_reservados) => {
            return `
            O contrato entre o locador ${locador.nome} ${locador.sobrenome} e o locatário ${locatario.nome} ${locatario.sobrenome} foi firmado com sucesso.

            Valor do contrato: R$ ${aluguel.valor}

            Período: ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} - ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}

            Espaço: ${espaco.titulo}
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.

            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Contrato realizado pela plataforma"
    },
    ON_REFUSED: {
        email: (user, espaco) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

             Desculpe-nos mas sua reserva do espaço: ${espaco.titulo} foi cancelada.

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Reserva cancelada"
    },
    ON_REFUSED_FOR_LOCADOR: {
        email: (user, locatario, espaco, comment) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            O locatário ${locatario.nome} ${locatario.sobrenome} cancelou a reserva do seu espaço ${espaco.titulo}.

            Motivos: ${comment}

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Reserva cancelada"
    },
    ON_REFUSED_FOR_LOCATARIO: {
        email: (user, locador, espaco, comment) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            O locador ${locador.nome} ${locador.sobrenome} cancelou a reserva do espaço ${espaco.titulo}.

            Motivos: ${comment}

            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Reserva cancelada"
    },
    ON_REFUSED_FOR_ADMIN: {
        email: (locador, locatario, aluguel, comment, canceledByLocador) => {
            return `
            Contrato cancelado pelo ${canceledByLocador? "locador": "locatário"}

            O contrato entre ${locador.nome} ${locador.sobrenome} e ${locatario.nome} ${locatario.sobrenome} no valor: R$ ${aluguel.valor} está encerrado.

            Motivos: ${comment}
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Contrato cancelado"
    },
    ON_CHECKIN_FOR_LOCATARIO: {
        email: (locatario, espaco) => {
            return `
            Olá ${locatario.nome} ${locatario.sobrenome}
            
            Você acabou de fazer check-in no local: ${espaco.titulo}
            ${espaco.local.rua} - ${espaco.local.bairro} - ${espaco.local.numero? espaco.local.numero + ' - ' : ''} - ${espaco.local.cidade} - ${espaco.local.estado} - CEP: ${espaco.local.cep}
            
            Conte com nosso apoio durante todo o periodo do contrato, para mais informações do seu anfitrião entre na plataforma e visualize os detalhes do seu contato.
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Check-in realizado"
    },
    ON_CHECKIN_FOR_LOCADOR: {
        email: (locador, locatario, espaco) => {
            return `
            Olá ${locador.nome} ${locador.sobrenome}
            
            O locatário: ${locatario.nome} ${locatario.sobrenome} realizou o checkin do espaço: ${espaco.titulo}
            
            Por favor, confirme a entrada na plataforma no seu painel de locações na aba ativos.
            
            Para mais informações entre em contato conosco diretamente pelos canais disponíveis em nossa plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Check-in realizado no seu espaço"
    },
    ON_CHECKIN_FOR_ADMIN: {
        email: (locador, locatario, espaco) => {
            return `
            O locatário: ${locatario.nome} ${locatario.sobrenome} realizou o check-in no espaço: ${espaco.titulo} do locador: ${locador.nome} ${locador.sobrenome}`;
        },
        subject: "Check-in realizado"
    }
}

module.exports = {
    TAXA_ALUGAVEL,
    NO_REPLY_EMAIL,
    USUARIO_STATUS,
    ALUGUEL_STATUS,
    ALUGAVEL_STATUS,
    EMAILS_USUARIO,
    EMAILS_ANUNCIO,
    EMAILS_CONTRATO
}