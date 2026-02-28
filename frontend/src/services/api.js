// ============================================================
// src/services/api.js
// ملف مركزي للتواصل مع الـ Backend API
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * دالة مساعدة للـ HTTP requests
 */
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        const message =
            data?.message ||
            (data?.errors && Object.values(data.errors).flat()[0]) ||
            'An unexpected error occurred';
        throw new Error(message);
    }

    return data;
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
    getAll: () => request('/students'),
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
    getAll: () => request('/courses'),
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
    exportTranscript: (studentId) => `${BASE_URL}/grades/export/${studentId}`,
    import: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${BASE_URL}/grades/import`, {
            method: 'POST',
            credentials: 'include',
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
    getMyCourses: (studentId) => request(`/registration/my-courses/${studentId}`),
    getAllRegistrations: (semesterId) => request(`/registration/admin/all/${semesterId}`),
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
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${BASE}/news/upload-image`, {
            method: 'POST',
            credentials: 'include',
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
