// ============================================================
// src/services/api.js
// ملف مركزي للتواصل مع الـ Backend API
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * دالة مساعدة للـ HTTP requests مع دعم الـ Authentication
 */
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        ...options,
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        // التعامل مع انتهاء الصلاحية أو عدم المصادقة
        if (response.status === 401 && !endpoint.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
        }

        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        }

        if (!response.ok) {
            const message =
                data?.message ||
                (data?.errors && Object.values(data.errors).flat()[0]) ||
                'An unexpected error occurred';
            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ============================================================
// Auth API
// ============================================================
export const authApi = {
    login(username, password) {
        return request('/login', {
            method: 'POST',
            body: { username, password },
        });
    },
    logout() {
        return request('/logout', { method: 'POST' });
    },
    me() {
        return request('/me');
    },
};

// ============================================================
// Students API
// ============================================================
export const studentsApi = {
    getAll: (params = '') => request(`/students${params ? (params.startsWith('?') ? params : `?${params}`) : ''}`),
    get: (id) => request(`/students/${id}`),
    create: (data) => request('/students', { method: 'POST', body: data }),
    update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
    getDepartments: () => request('/departments-simple'),
};

// ============================================================
// Professors API
// ============================================================
export const professorsApi = {
    getAll: () => request('/professors'),
    create: (data) => request('/professors', { method: 'POST', body: data }),
    update: (id, data) => request(`/professors/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/professors/${id}`, { method: 'DELETE' }),
    getMyCourses: (professorId) => request(`/professor/${professorId}/my-courses`),
    getMySchedule: (professorId) => request(`/professor/${professorId}/my-schedule`),
    getCourseStudents: (professorId, courseId, semesterId) => request(`/professor/${professorId}/course-students/${courseId}/${semesterId}`),
    updateGrades: (data) => request('/professor/update-grades', { method: 'POST', body: data }),
    // Admin Side
    getAllAssignments: () => request('/admin/course-assignments'),
    assignCourse: (data) => request('/admin/course-assignments', { method: 'POST', body: data }),
    deleteAssignment: (id) => request(`/admin/course-assignments/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Departments API
// ============================================================
export const departmentsApi = {
    getAll: () => request('/departments'),
    create: (data) => request('/departments', { method: 'POST', body: data }),
    update: (id, data) => request(`/departments/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/departments/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Courses API
// ============================================================
export const coursesApi = {
    getAll: (params = '') => request(`/courses${params ? (params.startsWith('?') ? params : `?${params}`) : ''}`),
    create: (data) => request('/courses', { method: 'POST', body: data }),
    update: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
};

export const semestersApi = {
    getAll: () => request('/semesters'),
    create: (data) => request('/semesters', { method: 'POST', body: data }),
    update: (id, data) => request(`/semesters/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/semesters/${id}`, { method: 'DELETE' }),
    activate: (id) => request(`/semesters/${id}/activate`, { method: 'POST' }),
};

export const gradesApi = {
    getAll: (params = '') => request(`/grades?${params}`),
    update: (id, data) => request(`/grades/${id}`, { method: 'PUT', body: data }),
    getSemesters: () => semestersApi.getAll(),
    exportTranscript: async (studentId) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/grades/export/${studentId}`, {
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!res.ok) throw new Error('Failed to download transcript');
        const blob = await res.blob();

        // Extract filename from header if available
        let filename = 'Transcript.csv';
        const disposition = res.headers.get('content-disposition');
        if (disposition && disposition.indexOf('filename=') !== -1) {
            const matches = /filename="([^"]+)"/.exec(disposition);
            if (matches && matches[1]) filename = matches[1];
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
    import: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/grades/import`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Import failed');
        return json;
    }
};

export const registrationApi = {
    verify: (data) => request('/registration/verify', { method: 'POST', body: data }),
    getAvailable: (studentId) => request(`/registration/available/${studentId}`),
    register: (data) => request('/registration/register', { method: 'POST', body: data }),
    unregister: (data) => request('/registration/unregister', { method: 'DELETE', body: data }),
    getMyCourses: (studentId) => request(`/registration/my-courses/${studentId}`),
    getAllRegistrations: (semesterId, level) => request(`/registration/admin/all/${semesterId}${level ? `?level=${level}` : ''}`),
    exportRegistrations: (params) => {
        const query = new URLSearchParams(params).toString();
        return `${BASE_URL}/registration/export?${query}`;
    }
};

// ============================================================
// News API
// ============================================================
export const newsApi = {
    getAll: (params = '') => request(`/news${params ? '?' + params : ''}`),
    create: (data) => request('/news', { method: 'POST', body: data }),
    update: (id, data) => request(`/news/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/news/${id}`, { method: 'DELETE' }),
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('token');
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${BASE}/news/upload-image`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Upload failed');
        return json;
    },
};

export const schedulesApi = {
    getAll: () => request('/admin/schedules'),
    generate: () => request('/admin/schedules/generate', { method: 'POST' }),
    delete: (id) => request(`/admin/schedules/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Test
// ============================================================
export const pingApi = () => request('/ping');

export default {
    authApi,
    studentsApi,
    professorsApi,
    departmentsApi,
    coursesApi,
    semestersApi,
    gradesApi,
    registrationApi,
    newsApi,
    schedulesApi,
    pingApi
};
