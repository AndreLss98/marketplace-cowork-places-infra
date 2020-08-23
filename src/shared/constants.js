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

module.exports = {
    TAXA_ALUGAVEL,
    NO_REPLY_EMAIL,
    USUARIO_STATUS,
    ALUGUEL_STATUS,
    ALUGAVEL_STATUS,
    EMAILS_USUARIO
}