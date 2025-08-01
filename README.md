## MadAI

**MadAi** é um app mobile que converte áudios em tarefas organizadas usando IA. O mascote "bravo" traz humor ao cobrar o usuário por atrasos. Basta gravar sua tarefa; a IA transcreve, interpreta, estrutura e sugere plano de ação e fontes úteis automaticamente.

### Funcionalidades

- Gravação de áudio via microfone
- Transcrição automática com a API Whisper
- Interpretação da tarefa com GPT-4
- Geração automática de:

  - Título, descrição, categoria, prioridade e data limite
  - Sugestões de fontes e um guia de início

- Mascote com falas personalizadas em tarefas urgentes ou atrasadas
- Armazenamento local de tarefas (AsyncStorage)
- Interface simples e orientada à usabilidade

### Tecnologias utilizadas

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- [OpenAI GPT-4](https://platform.openai.com/docs/guides/gpt) e [Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/) (gravação de áudio)
- [Expo Notifications](https://docs.expo.dev/push-notifications/overview/)
- [TypeScript](https://www.typescriptlang.org/)

### Instalação e execução

1. Clone o repositório:

```bash
git clone https://github.com/samuellna/criacomp-madai.git
cd criacomp-madai
```

2. Instale as dependências:

```bash
pnpm install
```

3. Crie um arquivo `.env` com a chave da OpenAI:

```env
OPENAI_API_KEY=coloque_sua_chave_aqui
```

4. Inicie o app:

```bash
pnpm start
```

### Estrutura do projeto

- `/components`: componentes reutilizáveis da interface (ex: gravador de voz)
- `/hooks`: hooks personalizados para manipular tarefas
- `/services`: integração com APIs (OpenAI)
- `/types`: interfaces e tipagens do projeto
- `/app`: telas e navegação

### Fluxo resumido

1. O usuário grava um áudio com o que precisa fazer.
2. O áudio é enviado para transcrição via Whisper.
3. O texto transcrito é processado pelo GPT-4:

   - Geração da tarefa (título, descrição, prioridade, prazo etc.)
   - Geração de guia prático e fontes relevantes

4. A tarefa é salva localmente.
5. Caso a tarefa fique próxima do prazo ou atrasada, o mascote MadAi pode emitir notificações com broncas personalizadas.


### Licença

Este projeto está licenciado sob a Licença MIT.
