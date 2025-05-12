# Ugym - Frontend

Aplicativo de fitness completo desenvolvido em React com TypeScript que permite o gerenciamento de atividades físicas com três tipos de usuários: Alunos, Personal Trainers e Academias. Interface responsiva e moderna utilizando Tailwind CSS.

## Funcionalidades

### Sistema de Autenticação e Perfis
- Sistema completo de login e cadastro
- Autenticação baseada em JWT
- Três tipos de usuários com interfaces específicas:
  - Alunos
  - Personal Trainers
  - Academias
- Configuração inicial de perfil para cada tipo de usuário

### Painel do Aluno
- **Dashboard** - Visão geral de progresso e atividades
- **Treinos** - Gerenciamento completo de treinos por dia da semana
  - Visualização e interação com exercícios
  - Marcação de exercícios realizados
  - Detalhes de execução com imagens e GIFs
- **Perfil** - Visualização e edição de informações pessoais
  - Dados biométricos
  - Objetivos de treino
  - Experiência e limitações físicas
  - Upload de foto de perfil
- **Relatórios** - Acompanhamento de métricas
  - Registro e histórico de medidas corporais
  - Visualização de gráficos de progresso
  - Histórico de peso e outros indicadores
- **Lista de Personais** - Visualização e vinculação com personal trainers
- **Eventos** - Inscrição e visualização de eventos na academia
- **Pagamentos** - Controle de pagamentos e planos de assinatura
- **Plano Alimentar** - Visualização da dieta (em desenvolvimento)

### Painel do Personal Trainer
- **Dashboard** - Visão geral de alunos e atividades
- **Gerenciamento de Alunos** - Lista de alunos vinculados
- **Criação de Treinos** - Elaboração de rotinas para alunos
  - Criação personalizada por dia da semana
  - Biblioteca de exercícios com imagens
  - Definição de séries, repetições e tempos de descanso
- **Relatórios** - Gerenciamento de progresso dos alunos
  - Registro de medidas e indicadores
  - Visualização de gráficos e histórico
- **Perfil Profissional** - Gerenciamento de informações
  - Dados de CREF
  - Especializações
  - Certificações
  - Redes sociais e biografia
  - Preço por hora
- **Eventos** - Criação e gerenciamento de atividades

### Painel da Academia
- **Dashboard** - Visão geral das atividades
- **Alunos** - Gerenciamento de membros
  - Lista completa de alunos
  - Cadastro de novos alunos
  - Visualização de perfis
- **Personal Trainers** - Gerenciamento de profissionais
  - Lista de personais vinculados
  - Cadastro de novos personais
  - Detalhes de cada profissional
- **Finanças** - Controle financeiro
  - Gerenciamento de pagamentos
  - Histórico de transações
  - Status de mensalidades
- **Eventos** - Gerenciamento de atividades
  - Criação e edição de eventos
  - Controle de inscrições
  - Comunicação com participantes
- **Perfil** - Gerenciamento de informações
  - Dados do estabelecimento
  - Horários de funcionamento
  - Comodidades e planos oferecidos
  - Redes sociais e contatos

### Funcionalidades Compartilhadas
- Sistema completo de eventos e calendário
- Gerenciamento de tarefas
- Interface responsiva (mobile e desktop)
- Tema claro/escuro (baseado na configuração do sistema)

## Tecnologias Utilizadas
- **React** + **TypeScript** - Desenvolvimento de interface
- **Tailwind CSS** - Estilização e responsividade
- **React Router** - Gerenciamento de rotas e navegação
- **Context API** - Gerenciamento de estado global
- **Axios** - Requisições HTTP
- **SweetAlert2** - Modais e notificações
- **Chart.js** - Visualização de dados em gráficos
- **Vite** - Tooling de desenvolvimento rápido

## Configuração do Projeto

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/eltobrgs/FrontEnd-UgymReact.git
   cd FrontEnd-UgymReact
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   # ou
   bun install
   ```

3. **Configure o ambiente**:
   - Crie um arquivo `.env` na raiz do projeto com:
   ```
   VITE_API_URL=https://backend-ugymreact.onrender.com
   # ou use localhost para desenvolvimento
   # VITE_API_URL=http://localhost:3000
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   # ou
   bun run dev
   ```

5. **Abra o navegador** em `http://localhost:5173`
