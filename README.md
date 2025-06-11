# Universo de Partículas Interativo

Um sistema de partículas 3D e nebulosa procedural fascinante e altamente personalizável, construído com React e Three.js. Esta aplicação permite aos usuários esculpir interativamente seus próprios visuais cósmicos únicos em tempo real.

**(Opcional: Adicione um GIF ou Captura de Tela da aplicação aqui)**
<!-- Exemplo: ![Demonstração do Universo de Partículas Interativo](link_para_seu_gif_ou_captura_de_tela.png) -->

## Funcionalidades

*   **Sistema de Partículas 3D Dinâmico:** Milhares de partículas animadas em um espaço 3D.
*   **Fundo de Nebulosa Procedural:** Uma nebulosa deslumbrante e em constante mudança, gerada com shaders.
*   **Painel de Controles Abrangente:**
    *   **Personalização de Partículas:** Ajuste a contagem, velocidade, direção (vertical/horizontal), tamanho e atenuação da opacidade.
    *   **Personalização da Nebulosa:** Controle as cores base e de destaque, detalhes (oitavas), escala (zoom), velocidade da animação, brilho, mistura de cores e intensidade da mudança dinâmica de cores.
    *   **Seletores de Cor:** Selecione facilmente cores personalizadas para as partículas e para a nebulosa.
    *   **Interação com o Mouse:** Habilite o movimento da câmera com base na posição do mouse.
    *   **Resolução da Renderização:** Ajuste a qualidade da renderização para otimizar o desempenho.
*   **Reatividade ao Áudio:** As partículas podem reagir visualmente ao áudio do sistema (requer permissão de compartilhamento de áudio da tela/aba).
*   **Atualizações em Tempo Real:** Todas as alterações de parâmetros são refletidas instantaneamente.
*   **Design Responsivo:** O canvas e os controles se adaptam a diferentes tamanhos de tela.
*   **Interface Intuitiva:** Painel de controles ocultável para uma visualização sem obstruções (alterne com a tecla 'H'), ícone de configurações ocultável (alterne a visibilidade com a tecla 'L').

## Tecnologias Utilizadas

*   **Frontend:** React 19
*   **Gráficos 3D:** Three.js
*   **Estilização:** Tailwind CSS (via CDN)
*   **Linguagem:** TypeScript
*   **Sistema de Módulos:** ES Modules com Import Maps (para carregamento nativo de módulos de dependências CDN no navegador)

## Primeiros Passos

Siga estas instruções para obter uma cópia local e executá-la.

### Pré-requisitos

*   **Node.js e npm (ou yarn):** Embora o projeto use CDNs para as principais bibliotecas, Node.js e npm são úteis para servir os arquivos localmente. Você pode baixá-los em [nodejs.org](https://nodejs.org/).

### Instalação e Configuração

1.  **Clone o repositório (ou baixe os arquivos):**
    Se você tiver o projeto em um repositório git:
    ```bash
    git clone <url-do-seu-repositorio>
    cd <nome-do-repositorio>
    ```
    Se você tiver apenas os arquivos soltos, crie um diretório principal para o projeto (ex: `universo-particulas-interativo`) e coloque os arquivos conforme descrito abaixo.

2.  **Organize os arquivos do projeto:**
    Garanta que a estrutura do seu projeto corresponda à descrita no início deste documento. Pontos chave:
    *   `index.html` e `metadata.json` estão na raiz.
    *   Uma pasta `src` contém todos os arquivos `.ts` e `.tsx`.
    *   Seu ponto de entrada principal do React (originalmente `index.tsx`) deve estar em `src/main.tsx`.
    *   `components/ControlsPanel.tsx` e `hooks/useParticleSystem.ts` estão em seus respectivos subdiretórios dentro de `src`.

3.  **Sem `npm install` explícito para dependências CDN:**
    O projeto está configurado para carregar React, React-DOM e Three.js diretamente de CDNs usando um "import map" no `index.html`. Nenhuma instalação local de `node_modules` é estritamente necessária para que essas bibliotecas principais executem o projeto como está.

### Executando a Aplicação

Como esta é uma aplicação frontend, você precisa de um servidor HTTP simples para servir o arquivo `index.html` e seus assets corretamente.

1.  **Navegue até o diretório raiz do seu projeto no terminal:**
    ```bash
    cd caminho/para/seu/universo-particulas-interativo
    ```

2.  **Use um servidor HTTP simples.** Aqui estão algumas opções comuns:

    *   **Usando `npx serve` (requer Node.js):**
        Esta é uma maneira direta se você tiver o Node.js instalado. `npx` executa o comando sem precisar instalar o `serve` globalmente.
        ```bash
        npx serve .
        ```
        Isso normalmente servirá o conteúdo em `http://localhost:3000` ou outra porta disponível. Verifique a saída do seu terminal para o endereço exato.

    *   **Usando o servidor HTTP embutido do Python (se você tiver Python instalado):**
        Para Python 3:
        ```bash
        python -m http.server
        ```
        Para Python 2:
        ```bash
        python -m SimpleHTTPServer
        ```
        Isso geralmente serve em `http://localhost:8000`.

3.  **Abra no seu navegador:**
    Assim que o servidor estiver em execução, abra seu navegador e navegue para o endereço local fornecido pelo servidor (ex: `http://localhost:3000` ou `http://localhost:8000`).

## Visão Geral dos Controles

A aplicação possui um painel de controle abrangente (alterne a visibilidade pressionando a tecla 'H') que permite personalizar:

*   **Aparência:** Resolução da renderização, opacidade das partículas, tamanho das partículas.
*   **Movimento:** Velocidade das partículas, direção vertical/horizontal, interação com o mouse.
*   **Forma e Movimento da Nebulosa:** Oitavas (detalhe), escala (zoom), velocidade, brilho, mistura de cores, intensidade da mudança dinâmica de cores.
*   **Personalização de Cores:** Seletores de cores dedicados для as cores primária, secundária e de destaque das partículas, bem como duas cores base e duas de destaque para a nebulosa.
*   **Reatividade ao Áudio:** Habilite/desabilite a visualização de áudio e ajuste a sensibilidade. Este recurso usa `getDisplayMedia` para capturar áudio de uma tela, aba ou janela compartilhada.
*   **Configuração Geral:** Contagem de partículas e um botão para "Recriar Universo", que reinicializa as posições das partículas com as configurações atuais.
*   O próprio ícone de configurações pode ser ocultado/mostrado pressionando a tecla 'L'.

## Como Funciona (Resumidamente)

*   **React:** Gerencia os componentes da UI (como o painel de controle) e o estado da aplicação.
*   **Three.js:** Lida com a renderização 3D das partículas e do fundo da nebulosa.
    *   As partículas são representadas como `THREE.Points` com um material de shader customizado para aparência dinâmica, opacidade baseada na profundidade e um efeito de cintilação.
    *   O fundo da nebulosa é um plano em tela cheia renderizado com um fragment shader customizado que gera padrões de ruído procedural (FBM - Fractional Brownian Motion) e cores dinâmicas e evolutivas.
*   **Shaders (GLSL):** Vertex e fragment shaders customizados são cruciais para alcançar os efeitos visuais complexos para partículas e a nebulosa de forma eficiente.
*   **Web Audio API & `getDisplayMedia`:** Quando a reatividade ao áudio está habilitada, a aplicação usa `navigator.mediaDevices.getDisplayMedia` para solicitar o compartilhamento de tela/aba (incluindo áudio). O fluxo de áudio é então processado usando a Web Audio API para analisar frequências e intensidades, que por sua vez influenciam os visuais das partículas (ex: tamanho).

## Observações

# Esse projeto foi criado usando Google AI Studio
---

Sinta-se à vontade para explorar e experimentar com os controles para criar suas próprias cenas cósmicas deslumbrantes!
