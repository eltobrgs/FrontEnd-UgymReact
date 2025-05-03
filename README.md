# Ugym

Este é um aplicativo de fitness desenvolvido em React que permite aos usuários gerenciar seus planos de treino, dieta e acompanhar seu progresso. O aplicativo possui uma interface amigável e é responsivo, funcionando bem em dispositivos móveis e desktops.

## Funcionalidades Implementadas

### Autenticação e Gerenciamento de Usuários
- ✅ Sistema de login e cadastro
- ✅ Perfis para diferentes tipos de usuários (Aluno, Personal, Academia)
- ✅ Edição de perfil de usuário

### Painel do Aluno
- ✅ Dashboard com visão geral do progresso
- ✅ Gerenciamento de treinos por dia da semana
- ✅ Visualização e interação com exercícios
- ✅ Acompanhamento de métricas (peso, medidas)
- ✅ Relatórios de progresso
- ✅ Lista de personais disponíveis

### Painel do Personal
- ✅ Dashboard com informações gerais
- ✅ Gerenciamento de alunos
- ✅ Criação e edição de treinos para alunos
- ✅ Geração de relatórios de progresso
- ✅ Perfil profissional com informações CREF

### Funcionalidades Compartilhadas
- ✅ Sistema de eventos/calendário
- ✅ Notificações e tarefas

### Funcionalidades em Desenvolvimento
- ⏳ Plano Alimentar: Gerenciamento completo de dieta e nutrição
- ⏳ Integração com wearables para acompanhamento automático
- ⏳ Comunicação interna (chat) entre aluno e personal

## Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construir interfaces de usuário
- **React Router**: Para gerenciamento de rotas no aplicativo
- **SweetAlert2**: Para exibir modais e alertas estilizados
- **Tailwind CSS**: Para estilização e design responsivo
- **Axios**: Para requisições HTTP à API backend

## Estrutura do Projeto

- **src**: Contém todos os componentes, páginas e estilos do aplicativo
  - **components**: Componentes reutilizáveis
  - **pages**: Organizadas por tipo de usuário (AlunoPages, PersonalPages, AcademiaPages)
  - **contexts**: Gerenciamento de estado global e autenticação
  - **layouts**: Estruturas de layout compartilhadas
  - **routes**: Configuração de rotas e proteção por papel de usuário

## Como Configurar o Projeto

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/eltobrgs/UgymReact.git
   cd UgymReact
   ```

2. **Instale as dependências**:
   ```bash
   bun install
   ```

3. **Inicie o aplicativo**:
   ```bash
   bun run dev
   ```
