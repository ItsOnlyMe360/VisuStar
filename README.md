# VisuStar

Um sistema de partículas 3D e nebulosa procedural fascinante e altamente personalizável, construído com React e Three.js. Esta aplicação permite aos usuários esculpir interativamente seus próprios visuais cósmicos únicos em tempo real.

![Demo](https://c.feridinha.com/EyOTG.png)

## Tecnologias Utilizadas

*   **Frontend:** React 19
*   **Gráficos 3D:** Three.js
*   **Estilização:** Tailwind CSS (via CDN)
*   **Linguagem:** TypeScript
*   **Sistema de Módulos:** ES Modules com Import Maps (para carregamento nativo de módulos de dependências CDN no navegador)

## Primeiros Passos

Siga estas instruções para obter uma cópia local e executá-la.

### Pré-requisitos

*   **Node.js e npm:** Você pode baixá-los em [nodejs.org](https://nodejs.org/).

### Instalação e Configuração

1.  **Clone o repositório (ou baixe os arquivos):**
    Se você tiver o projeto em um repositório git:
    ```bash
    git clone https://github.com/ItsOnlyMe360/VisuStar/
    cd VisuStar
    ```

### Executando

   * Use ```npm install``` para instalar todas as dependências e ```npm run dev```

OBS: se quiser que os dispositivos na sua rede local também possam acessar o site, use ```npm run dev -- --host 0.0.0.0```

## Visão Geral dos Controles

A aplicação possui um painel de controle abrangente (alterne a visibilidade pressionando a tecla 'H') que permite personalizar:

*   **Aparência:** Resolução da renderização, opacidade das partículas, tamanho das partículas.
*   **Movimento:** Velocidade das partículas, direção vertical/horizontal, interação com o mouse.
*   **Forma e Movimento da Nebulosa:** Oitavas (detalhe), escala (zoom), velocidade, brilho, mistura de cores, intensidade da mudança dinâmica de cores.
*   **Personalização de Cores:** Seletores de cores dedicados для as cores primária, secundária e de destaque das partículas, bem como duas cores base e duas de destaque para a nebulosa.
*   **Reatividade ao Áudio:** Habilite/desabilite a visualização de áudio e ajuste a sensibilidade. Este recurso usa `getDisplayMedia` para capturar áudio de uma tela, aba ou janela compartilhada.
*   **Configuração Geral:** Contagem de partículas e um botão para "Recriar Universo", que reinicializa as posições das partículas com as configurações atuais.
*   O próprio ícone de configurações pode ser ocultado/mostrado pressionando a tecla 'L'.

## Observações

* Esse projeto foi criado usando Google AI Studio, sinta se livre pra usar como quiser.
---
