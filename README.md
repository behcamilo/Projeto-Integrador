# Plataforma de Agendamento de Tatuagens (P1K4) - Projeto Integrador

Esta plataforma foi desenvolvida para facilitar a conexão entre tatuadores e clientes, permitindo a gestão de portefólios, a descoberta de novos estilos e o agendamento de sessões de tatuagem de forma integrada.

O sistema divide-se em duas grandes áreas: uma para o **Tatuador** gerir a sua arte e agenda, e outra para o **Cliente** explorar e marcar sessões.

---

## 🚀 Funcionalidades

### **Para Tatuadores (Artistas)**
- **Gestão de Perfil:** Criação de conta profissional com biografia, nome do estúdio e foto de perfil.  
- **Portefólio (Feed):** Publicação de trabalhos realizados com detalhes técnicos (tamanho, preço estimado, tempo de sessão e estilo).  
- **Gestão de Agenda:** Visualização de calendário interativo, definição de horários disponíveis e gestão de pedidos de agendamento (aceitar / recusar / ocupar).

### **Para Clientes (Utilizadores)**
- **Exploração:** Visualização de um feed de tatuagens com filtros por texto.  
- **Favoritos:** Possibilidade de "curtir" e guardar tatuagens favoritas.  
- **Agendamento:** Solicitação de sessões diretamente através de uma publicação (tatuagem específica) ou visualizando a disponibilidade geral do artista.  
- **Perfil:** Área pessoal para gerir dados e ver tatuagens favoritas.

---

## 🛠 Tecnologias Utilizadas

### **Backend**
- Python / Django  
- Django REST Framework (DRF)  
- PostgreSQL  
- JWT (SimpleJWT)

### **Frontend**
- Angular (v19)  
- SCSS  
- RxJS

### **Infraestrutura**
- Docker & Docker Compose (orquestração dos contentores: Backend, Frontend e Base de Dados)

---

## ⚙️ Como Executar o Projeto

A forma mais simples de executar a aplicação é utilizando o **Docker**, pois o projeto já contém todas as configurações necessárias (`docker-compose.yml`).

### **Pré-requisitos**
- Docker e Docker Compose instalados  
- Git

### **Passo a Passo (Via Docker)**

#### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd Projeto-Integrador
```

#### 2. Iniciar a aplicação
Execute o seguinte comando na raiz do projeto (onde está o ficheiro docker-compose.yml):
```bash
docker-compose up --build
```

#### 3. Parar Aplicação
```bash
docker-compose down
```
Este comando irá descarregar as imagens necessárias, configurar a base de dados PostgreSQL, aplicar as migrações do Django automaticamente e iniciar os servidores.

#### 3. Aceder à Aplicação

Frontend (Angular): http://localhost:4200

Backend (Admin): http://localhost:8000/admin

Utilize também os endpoints disponíveis da API
