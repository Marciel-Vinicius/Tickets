// frontend/src/config.js

// Mantemos a variável só para casos especiais (novo domínio HTTPS etc),
// mas por padrão deixamos vazio, assim todas as chamadas ficarão em:
//    fetch("/api/…")  ➔ proxy via static.yaml  ➔ VM HTTP
const API_URL = process.env.REACT_APP_API_URL ?? '';

export default API_URL;