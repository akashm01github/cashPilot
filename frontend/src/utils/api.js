import axios from 'axios'

// ✅ CREATE axios instance
const API = axios.create({
    baseURL: 'https://cashpilot-hlzk.onrender.com'
})

// ✅ ADD THIS (token interceptor)
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token")

    if (token) {
        req.headers.Authorization = `Bearer ${token}`
    }

    return req
})

// ✅ API functions
export const getMonthShifts = (year, month) =>
    API.get(`/api/shifts/${year}/${month}`)

export const saveShift = (data) =>
    API.post('/api/shifts', data)

export const deleteShift = (year, month, day) =>
    API.delete(`/api/shifts/${year}/${month}/${day}`)

export default API
