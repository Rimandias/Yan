# Yan

Jogo de dados "Yan" (variante de Yahtzee com 4 colunas, pass-and-play, 1 a 4 jogadores)
construído com [Expo](https://expo.dev) (React Native + TypeScript), pensado para depois
ser publicado na Google Play e na App Store.

## Regras

Cada jogador preenche uma cartela com **4 colunas independentes**, cada uma com as
mesmas 14 jogadas:

- **Seção superior**: Ases, Duques, Ternos, Quadras, Quinas, Senas (soma dos dados daquele valor)
- **Seção inferior**: 2 Pares, Trinca, Full House, Sequência Mínima, Sequência Máxima,
  Quadra, Chance, Yan (5 dados iguais)

Não existe uma etapa de "escolher a coluna" antes de rolar: em cada turno o jogador
rola os dados normalmente (até 3 rolagens, podendo segurar dados entre elas) e, com o
resultado em mãos, escolhe em qual coluna/jogada da cartela quer colocá-lo. O jogo não
sinaliza de antemão quais jogadas estão disponíveis — todas as células vazias aparecem
iguais e clicáveis — mas impede a colocação se ela não for válida naquele momento:

| Coluna | Regra |
|---|---|
| **Descida** | só aceita a próxima jogada na ordem Ases → ... → Yan |
| **Subida** | só aceita a próxima jogada na ordem inversa Yan → ... → Ases |
| **Desordem** | aceita qualquer jogada livre ainda não preenchida, em qualquer ordem |
| **Seco** | aceita qualquer jogada livre, em qualquer ordem, mas só com o resultado da **1ª rolagem** do turno (se o jogador segurar e rolar de novo, o Seco fica indisponível até o próximo turno) |

Sempre que a rolagem não pontuar na jogada escolhida, a jogada é **riscada**
(fica com 0 pontos) e nunca mais pode receber valor.

### Bônus (por coluna)

- **Bônus da seção superior**: soma da seção superior ≥ 60 → **+40**
- **Bônus de coluna completa**: só é concedido se a coluna já tiver o bônus da seção
  superior **e** nenhuma jogada da coluna tiver sido riscada → **+40** adicionais

O total do jogador é a soma dos totais das 4 colunas.

## Interface

O app é mobile-first e **não usa rolagem de tela**: a cartela inteira (4 colunas x 14
jogadas) sempre cabe na tela, com linhas e colunas dimensionadas dinamicamente conforme
o tamanho do aparelho. Os dados são renderizados em **3D** (cubos com `transform`
nativo, sem bibliotecas gráficas externas) e ficam num painel flutuante **sobre** a
cartela — ao rolar, cada dado não segurado gira e assenta na face correspondente ao
valor sorteado; tocar num dado alterna se ele fica seguro para a próxima rolagem.

## Estrutura do projeto

```
App.tsx                  # ponto de entrada da UI (alterna Novo Jogo <-> Jogo)
src/
  game/                   # lógica do jogo, pura e sem dependência de UI
    types.ts              # tipos: DieValue, Player, ColumnId, GameState...
    categories.ts         # categorias, colunas (regras de ordem/rolagem) e bônus
    scoring.ts            # cálculo de pontos de cada categoria
    totals.ts             # totais por coluna (bônus superior + bônus de coluna) e do jogador
    engine.ts             # máquina de estados: createGame, rollDice, toggleHold,
                           # canPlaceScore, selectCategory
    __tests__/             # testes unitários da lógica (Jest)
  components/             # componentes de UI reutilizáveis
    Die3D.tsx              # dado em 3D (cubo com as 6 faces via transform), com
                            # animação de giro até a face sorteada
    DiceTray.tsx            # painel flutuante com os 5 dados 3D + botão de rolar,
                             # exibido sobre a cartela
    ScoreBoard.tsx           # cartela completa (4 colunas x 14 jogadas), interativa
                             # e sem rolagem de tela: toda célula vazia é clicável e
                             # igual visualmente; a validade só é checada no toque
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
   (hoje estão como placeholder `com.example.yan`).
2. Substituir os ícones em `assets/` pelos ícones finais do app.
3. Criar uma conta Expo (EAS) e rodar `npx eas build` para gerar os binários de loja.
