# ⚙️ Documentação Técnica da API

A API do InovaSys permite integração direta com sistemas de tribunais e ERPs jurídicos.

## 🔑 Autenticação
Todas as requisições devem incluir o token JWT no cabeçalho:
`Authorization: Bearer <seu_token>`

## 📡 Endpoints Principais
- `GET /v1/processos`: Lista processos vinculados à sua chave.
- `POST /v1/eventos`: Registra uma nova movimentação na timeline.
- `GET /v1/docs/templates`: Retorna os modelos de documentos disponíveis.

## 💻 Exemplo de Requisição
```bash
curl -X GET "https://api.inovasys.com/v1/user/profile" \
     -H "Authorization: Bearer <token>"
```
