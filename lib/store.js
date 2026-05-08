// lib/store.js - localStorage-based data persistence

const DEFAULT_ADMIN = { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' };

export function initStore() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('edubot_users')) {
    localStorage.setItem('edubot_users', JSON.stringify([DEFAULT_ADMIN]));
  }
  if (!localStorage.getItem('edubot_materials')) {
    localStorage.setItem('edubot_materials', JSON.stringify([]));
  }
}

export function getUsers() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('edubot_users') || '[]');
}

export function addUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('edubot_users', JSON.stringify(users));
}

export function removeUser(username) {
  const users = getUsers().filter(u => u.username !== username);
  localStorage.setItem('edubot_users', JSON.stringify(users));
}

export function getMaterials() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('edubot_materials') || '[]');
}

export function addMaterial(material) {
  const materials = getMaterials();
  materials.push({ ...material, id: Date.now().toString(), uploadedAt: new Date().toISOString() });
  localStorage.setItem('edubot_materials', JSON.stringify(materials));
}

export function removeMaterial(id) {
  const materials = getMaterials().filter(m => m.id !== id);
  localStorage.setItem('edubot_materials', JSON.stringify(materials));
}

export function getMaterialsByYearAndSubject(year, subject) {
  return getMaterials().filter(
    m => m.year === year && m.subject.toLowerCase() === subject.toLowerCase()
  );
}

export function login(username, password, role) {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password && u.role === role) || null;
}

export function setSession(user) {
  sessionStorage.setItem('edubot_session', JSON.stringify(user));
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const s = sessionStorage.getItem('edubot_session');
  return s ? JSON.parse(s) : null;
}

export function clearSession() {
  sessionStorage.removeItem('edubot_session');
}
