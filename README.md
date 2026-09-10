# XtreamlyTV for LG webOS — Edição Customizada

Player Xtream Codes (Live TV / Filmes / Séries) para TVs LG webOS, baseado no upstream open source 0.6.0, com uma camada de melhorias validadas em hardware real (LG webOS / Chromium antigo).

## Funcionalidades desta edição (v0.7.0-qr)

- **QR Code Cloud Sync** (NOVO): botão ☁ Add via QR na tela de login e em Settings → TV mostra QR na tela → escaneie com o celular → digite a lista no painel web (teclado fácil!) → TV recebe em ~5s. Fim da digitação no controle remoto!
- **Multi-provedores**: salve vários provedores Xtream; troque com Use / Edit / Delete sem redigitar credenciais (Settings > Providers)
- **Olho na senha**: botão Show/Hide no editor de provedor
- **ALL (busca global)**: categoria ALL no trilho de Live TV, Movies e Series carrega a biblioteca inteira do provedor
- **Clear all por seção**: botões independentes para limpar histórico de Live TV, Movies e Series na Home
- **Foco de temporada**: ao trocar de temporada numa série, o foco permanece no botão da temporada
- **Grid padronizado**: tamanho de linha fixo (sem cards/letras gigantes em categorias grandes) — correção de loop de realimentação do VirtualGrid
- **Scroll funcional**: containers com altura real de tela; rolagem nos catálogos e configurações
- Compatível com controle remoto (navegação por foco) e roda 100% offline após conectar ao provedor

## Build e instalação

    npm install
    npm run build:webos        # gera dist/webos/com.github.xtreamlytv.webos_0.7.0_all.ipk
    ares-install dist/webos/*.ipk   # TV em modo desenvolvedor, mesma rede
    ares-launch com.github.xtreamlytv.webos

## Histórico de versões (tags)

| Tag | Conteúdo |
|---|---|
| v0.6.0-original | Upstream do site, intocado |
| v0.6.1-fase1-provedores | Multi-provedores (login + gerenciador) |
| v0.6.3-estavel | Base intermediária validada |
| v0.7.0-estavel | ALL global + clear all + grid padronizado + scroll |
| **v0.7.0-qr** | **🆕 NOVO**: QR Code Cloud Sync via painel web Supabase |

## Aviso

Projeto pessoal. Não inclui canais, filmes ou subscrições — o conteúdo vem do provedor Xtream do usuário.
