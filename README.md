# Projeto Golden Raspberry Awards API

Este projeto implementa uma API para gerenciar e consultar os vencedores do prêmio Golden Raspberry Awards (Framboesa de Ouro). O foco principal é identificar os **produtores com os menores e maiores intervalos** entre duas vitórias consecutivas.

<br />

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Node.js**: Versão 18 ou superior recomendada.
- **npm**: Gerenciador de pacotes do Node.js (geralmente vem com o Node.js).

### Instalação

1.  Clone o repositório para o seu ambiente local:
    ```bash
    git clone https://github.com/Junior743/outsera-backend.git
    cd outsera-backend
    ```
2.  Instale todas as dependências do projeto:
    ```bash
    npm install
    ```

### Executando a Aplicação (Servidor de Desenvolvimento)

1.  Certifique-se de ter o arquivo `movielist.csv` na raiz do projeto.
2.  Inicie o servidor:
    ```bash
    npm run dev
    ```
    O servidor estará disponível em `http://localhost:3000` (ou na porta configurada via variáveis de ambiente).
    Acesse: `http://localhost:3000/api/v1/dashboard/min-max` para ver o resultado dos intervalos.

### Executando a Aplicação (Servidor de Produção)

1.  Certifique-se de ter o arquivo `movielist.csv` na raiz do projeto.
2.  Inicie o servidor:
    ```bash
    npm run start
    ```

### Rodando os Testes

1.  Certifique-se de ter o arquivo `testdata.csv` (com a massa de dados específica para teste) no diretório `src/tests/`.
2.  Execute os testes:
    ```bash
    npm run test
    ```
    Você verá o resultado da execução dos testes no console.

---

## 🏗️ Arquitetura e Estrutura

A arquitetura do projeto foi pensada para seguir os princípios de **separação de responsabilidades** e **modularidade**. Isso garante que o código seja escalável, fácil de manter e testar.

- **Camadas Principais:**
  - **`src/controllers`**: Responsável por lidar com as **requisições HTTP**. Ele coordena as chamadas aos serviços e envia as respostas ao cliente.
  - **`src/services`**: Contém a **lógica de negócio** da aplicação. Aqui, as regras são implementadas, orquestrando as operações de leitura e escrita no banco de dados através dos repositórios.
  - **`src/models`**: Define as **entidades do banco de dados** (esquema das tabelas) usando o TypeORM.
  - **`src/config`**: Armazena as **configurações globais** da aplicação, como a inicialização do banco de dados.
  - **`src/routes`**: Define as **rotas da API**, mapeando os endpoints para os controladores correspondentes.
  - **`src/index.ts`**: É o **ponto de entrada** da aplicação, onde o servidor Express é configurado e iniciado.

---

## 🗄️ Modelo de Dados (Database Schema)

O banco de dados SQLite é estruturado para armazenar informações sobre filmes, prêmios, estúdios, produtores e as nomeações/vitórias. As entidades são mapeadas usando TypeORM e representam as seguintes tabelas:

- **`movies`**:

  - **Responsabilidade**: Armazena informações detalhadas sobre cada filme.
  - **Campos Chave**: `id` (chave primária), `title` (título do filme), `year` (ano de lançamento).
  - **Relacionamentos**: Possui relacionamentos muitos-para-muitos (`@ManyToMany`) com `studios` e `producers` (via tabelas de junção) e um-para-muitos (`@OneToMany`) com `nominated_movies`.

- **`awards`**:

  - **Responsabilidade**: Registra os anos em que os prêmios Framboesa de Ouro foram concedidos.
  - **Campos Chave**: `id` (chave primária), `year` (ano do prêmio).
  - **Relacionamentos**: Possui um relacionamento um-para-muitos (`@OneToMany`) com `nominated_movies`.

- **`studios`**:

  - **Responsabilidade**: Armazena os nomes dos estúdios de cinema.
  - **Campos Chave**: `id` (chave primária), `name` (nome do estúdio).
  - **Relacionamentos**: Possui relacionamento muitos-para-muitos (`@ManyToMany`) com `movies` (via `movie_studios`).

- **`producers`**:

  - **Responsabilidade**: Armazena os nomes dos produtores de cinema.
  - **Campos Chave**: `id` (chave primária), `name` (nome do produtor).
  - **Relacionamentos**: Possui relacionamento muitos-para-muitos (`@ManyToMany`) com `movies` (via `movie_producers`).

- **`nominated_movies`**:

  - **Responsabilidade**: Tabela de junção que registra as nomeações de filmes para os prêmios, indicando se o filme foi um vencedor ou não para um determinado ano/prêmio.
  - **Campos Chave**: `id` (chave primária), `year` (ano da nomeação), `winner` (booleano indicando se o filme venceu).
  - **Relacionamentos**: Possui relacionamentos muitos-para-um (`@ManyToOne`) com `movies` e `awards`.

- **`movie_studios` (Tabela de Junção)**:

  - **Responsabilidade**: Liga filmes a estúdios, representando o relacionamento muitos-para-muitos.
  - **Campos Chave**: `movieId`, `studioId`.

- **`movie_producers` (Tabela de Junção)**:
  - **Responsabilidade**: Liga filmes a produtores, representando o relacionamento muitos-para-muitos.
  - **Campos Chave**: `movieId`, `producerId`.

---

## 🛠️ Ferramentas e Bibliotecas Utilizadas

O projeto foi desenvolvido usando um conjunto de ferramentas e bibliotecas robustas:

- **Node.js**: Ambiente de execução para JavaScript e TypeScript.
- **TypeScript**: Linguagem que adiciona tipagem estática ao JavaScript, o que melhora a segurança e a manutenibilidade do código.
- **Express.js**: Framework web minimalista e flexível, ideal para a construção de APIs REST.
- **TypeORM**: Um ORM (Object Relational Mapper) poderoso que permite interagir com bancos de dados relacionais (como SQLite) usando objetos TypeScript/JavaScript, sem a necessidade de escrever SQL manualmente.
- **SQLite**: Um sistema de gerenciamento de banco de dados relacional leve e autônomo, perfeito para ambientes de desenvolvimento e testes.
- **CSV-Parser**: Biblioteca utilizada para analisar e processar arquivos CSV, permitindo a importação dos dados para o banco.
- **Jest**: O framework de testes mais popular para JavaScript/TypeScript, usado para implementar os testes de integração.
- **Supertest**: Uma biblioteca que facilita os testes de APIs HTTP, permitindo que as requisições sejam feitas diretamente contra a instância do aplicativo Express.

---

## 🛣️ Endpoints da API

A API expõe o seguinte endpoint para consultar os intervalos de prêmios:

- **`GET /api/v1/dashboard/min-max`**:
  - **Descrição**: Retorna os produtores com os menores e maiores intervalos entre duas vitórias consecutivas no Golden Raspberry Awards, com base nos dados carregados no banco de dados.
  - **Resposta de Exemplo (200 OK)**:
    ```json
    {
      "min": [
        {
          "producer": "Joel Silver",
          "interval": 1,
          "previousWin": 1990,
          "followingWin": 1991
        }
      ],
      "max": [
        {
          "producer": "Matthew Vaughn",
          "interval": 13,
          "previousWin": 2002,
          "followingWin": 2015
        }
      ]
    }
    ```
