# Yahtzee

Jogo de Yahtzee (pass-and-play, 1 a 4 jogadores) construído com [Expo](https://expo.dev)
(React Native + TypeScript), pensado para depois ser publicado na Google Play e na App Store.

## Estrutura do projeto

```
App.tsx                  # ponto de entrada da UI (alterna Novo Jogo <-> Jogo)
src/
  game/                   # lógica do jogo, pura e sem dependência de UI
    types.ts              # tipos: DieValue, Player, GameState, CategoryId...
    categories.ts         # definição das categorias (nome, seção)
    scoring.ts            # cálculo de pontos de cada categoria
    totals.ts             # soma da seção superior, bônus e total geral
    engine.ts             # máquina de estados: createGame, rollDice,
                           # toggleHold, selectCategory
    __tests__/             # testes unitários da lógica (Jest)
  components/             # componentes de UI reutilizáveis
    Die.tsx                # um dado (com pips), clicável para segurar
    DiceTray.tsx            # os 5 dados + botão de rolar
    ScoreTable.tsx          # tabela de pontuação com preview de pontos
    PrimaryButton.tsx       # botão padrão do app
  screens/
    NewGameScreen.tsx       # tela de configuração de jogadores
    GameScreen.tsx           # tela de jogo + tela de fim de jogo
```

A lógica do jogo (`src/game`) é totalmente independente de React/React Native:
funções puras e imutáveis, fáceis de testar e de reaproveitar em outra UI no futuro.

## Rodando o projeto

```bash
npm install
npm run start    # abre o Metro/Expo Dev Tools (escolha Android, iOS ou Web)
npm run android  # abre direto no emulador/dispositivo Android
npm run ios      # abre direto no simulador iOS (requer macOS)
npm run web      # abre no navegador
```

## Testes

```bash
npm test         # roda os testes unitários da lógica do jogo (Jest)
npm run test:watch
```

## Publicando na Google Play / App Store

Este projeto usa Expo, que permite gerar builds nativos para as duas lojas com o
[EAS Build](https://docs.expo.dev/build/introduction/) sem precisar configurar Xcode/Android
Studio manualmente. Antes de gerar o build de produção:

1. Definir um `bundleIdentifier` (iOS) e `package` (Android) definitivos em `app.json`
   (hoje estão como placeholder `com.example.yahtzee`).
2. Substituir os ícones em `assets/` pelos ícones finais do app.
3. Criar uma conta Expo (EAS) e rodar `npx eas build` para gerar os binários de loja.
