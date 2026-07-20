import axios from 'axios'

const api = axios.create({
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY || 'pennypath-dev-key',
  },
})

export default api
