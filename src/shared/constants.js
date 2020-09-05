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
    
            Bem vindo a Placeet.
            
            Clique no link abaixo para confirmar seu email:
            
            https://placeet.com/confirm-email?token=${user.email_token}
            
            Caso você não tenha criado conta na Placeet e está recebendo este email por engano, por favor ignore-o.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: 'Confirme seu email'
    },
    RESET_PASSWORD: {
        email: (user) => {
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
            
            Seu cadastro na plataforma Placeet foi aprovado com sucesso.
            
            Aproveite e faça o seu primeiro contrato ou cadastre o seu espaço.
            
            Para mais informaçoes entre em contato conosco diretamente pela plataforma.
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
            
            Seu cadastro na plataforma Placeet foi reprovado em nossa analise.
            
            Motivos: ${comment}
            
            Para mais informaçoes entre em contato conosco diretamente pela plataforma.
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
            Olá ${user.nome} ${user.sobrenome}

            Seu anúncio foi aprovado, ele pode ser visualizado em:

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

            Seu anúncio foi reprovado.

            Motivos: ${comment}
            
            Para mais informaçoes entre em contato conosco diretamente pela plataforma.
            
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
            
            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
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
            
            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
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
            Período: ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} - ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}`;
        },
        subject: "Nova reserva foi paga"
    },
    ON_ACCEPT_FOR_LOCATARIO: {
        email: (user, espaco, dias_reservados) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Sua reserva do espaço: ${espaco.titulo} foi aceita pelo locador.
            Ela inicia ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} e finaliza ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}

            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
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

            Certifique-se de deixar o local em ordem para que tudo ocorra bem.
            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Contrato realizado"
    },
    ON_ACCEPT_FOR_ADMIN: {
        email: (locador, locatario, aluguel, espaco, dias_reservados) => {
            return `
            Um contrato entre o locador ${locador.nome} ${locador.sobrenome} e o locatário ${locatario.nome} ${locatario.sobrenome} foi firmado com sucesso.
            Valor do contrato: R$ ${aluguel.valor}
            Período: ${sharedFunctions.convertDate(new Date(dias_reservados.data_entrada))} - ${sharedFunctions.convertDate(new Date(dias_reservados.data_saida))}
            Espaço: ${espaco.titulo}`;
        },
        subject: "Contrato realizado pela plataforma"
    },
    ON_REFUSED: {
        email: (user, espaco) => {
            return `
            Olá ${user.nome} ${user.sobrenome}

            Sua reserva do espaço: ${espaco.titulo} foi cancelada.

            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
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

            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
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

            Qualquer dúvida entre em contato conosco diretamente pela plataforma.
            
            Abraços,
            
            Equipe Placeet`;
        },
        subject: "Reserva cancelada"
    },
    ON_REFUSED_FOR_ADMIN: {
        email: (locador, locatario, aluguel, comment, canceledByLocador) => {
            return `
            Contrato cancelado pelo ${canceledByLocador? "locador": "locatário"}

            O contrato entre ${locador.nome} ${locador.sobrenome} e ${locatario.nome} ${locatario.sobrenome} no valor: R$ ${aluguel.valor}

            Motivos: ${comment}`;
        },
        subject: "Contrato cancelado"
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