// mockBackend.js - A local-storage based simulation of the Base44 SDK
const STORAGE_PREFIX = 'churchapp_db_';

const getStorage = (key) => {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  return data ? JSON.parse(data) : [];
};

const setStorage = (key, data) => {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
};

const uuid = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

class EntityManager {
  constructor(entityName) {
    this.entityName = entityName;
  }

  async get(id) {
    const items = getStorage(this.entityName);
    const item = items.find(i => i.id === id);
    if (!item) throw { status: 404, message: `${this.entityName} not found` };
    return item;
  }

  async filter(query = {}, sort = '-created_date', limit = 100) {
    let items = getStorage(this.entityName);
    
    // Simple filter
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined && query[key] !== null) {
        items = items.filter(item => item[key] === query[key]);
      }
    });

    // Simple sort (only handles -created_date or similar)
    if (sort.startsWith('-')) {
      const field = sort.substring(1);
      items.sort((a, b) => new Date(b[field] || 0) - new Date(a[field] || 0));
    } else {
      items.sort((a, b) => new Date(a[sort] || 0) - new Date(b[sort] || 0));
    }

    return items.slice(0, limit);
  }

  async create(data) {
    const items = getStorage(this.entityName);
    const newItem = {
      ...data,
      id: uuid(),
      created_date: new Date().toISOString(),
    };
    items.push(newItem);
    setStorage(this.entityName, items);
    return newItem;
  }

  async update(id, data) {
    const items = getStorage(this.entityName);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw { status: 404, message: `${this.entityName} not found` };
    
    items[idx] = { ...items[idx], ...data, updated_date: new Date().toISOString() };
    setStorage(this.entityName, items);
    return items[idx];
  }

  async delete(id) {
    const items = getStorage(this.entityName);
    const filtered = items.filter(i => i.id !== id);
    setStorage(this.entityName, filtered);
    return { success: true };
  }
}

const entitiesList = [
  'Announcement', 'Attendance', 'Church', 'Mission', 
  'MissionSubmission', 'PointTransaction', 'Reward', 
  'RewardRedemption', 'Student', 'User'
];

const entities = entitiesList.reduce((acc, name) => {
  acc[name] = new EntityManager(name);
  return acc;
}, {});

const auth = {
  me: async () => {
    const user = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'current_user'));
    if (!user) throw { status: 401, message: 'Unauthorized' };
    return user;
  },
  updateMe: async (data) => {
    const user = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'current_user')) || {
      id: 'default-user-id',
      email: 'user@example.com',
      full_name: 'Test User',
    };
    const updatedUser = { ...user, ...data };
    localStorage.setItem(STORAGE_PREFIX + 'current_user', JSON.stringify(updatedUser));
    
    // Also update in User entity table
    try {
      const users = getStorage('User');
      const idx = users.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        setStorage('User', users);
      } else {
        users.push(updatedUser);
        setStorage('User', users);
      }
    } catch (e) {}
    
    return updatedUser;
  },
  logout: (redirect) => {
    localStorage.removeItem(STORAGE_PREFIX + 'current_user');
    if (redirect) window.location.href = '/';
  },
  redirectToLogin: (redirect) => {
    // For mock, we just ensure a base user exists and reload
    const defaultUser = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      full_name: 'Dev Admin',
      onboarded: false,
    };
    localStorage.setItem(STORAGE_PREFIX + 'current_user', JSON.stringify(defaultUser));
    window.location.reload();
  }
};

const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Return a fake URL (in a real app, you'd use FileReader or an actual upload)
      return { file_url: URL.createObjectURL(file) };
    }
  }
};

// Seed initial data if empty
const seed = () => {
  if (getStorage('Church').length === 0) {
    const churchId = uuid();
    setStorage('Church', [{
      id: churchId,
      name: 'Grace Community Church',
      join_code: 'CHURCH',
      created_date: new Date().toISOString()
    }]);

    setStorage('Mission', [
      {
        id: uuid(),
        church_id: churchId,
        title: 'Memorize John 3:16',
        description: 'Recite this verse to your teacher next Sunday.',
        points_reward: 50,
        mission_type: 'bible_verse',
        status: 'active',
        created_date: new Date().toISOString()
      },
      {
        id: uuid(),
        church_id: churchId,
        title: 'Help Clean Up',
        description: 'Stay 10 minutes after class to help organize the toys.',
        points_reward: 30,
        mission_type: 'kindness',
        status: 'active',
        created_date: new Date().toISOString()
      }
    ]);

    setStorage('Reward', [
      {
        id: uuid(),
        church_id: churchId,
        name: 'Super Sticker Pack',
        description: 'A collection of 20 shiny stickers!',
        points_cost: 100,
        category: 'toy',
        status: 'active',
        created_date: new Date().toISOString()
      },
      {
        id: uuid(),
        church_id: churchId,
        name: 'Ice Cream Party',
        description: 'One free scoop of your favorite flavor.',
        points_cost: 500,
        category: 'snack',
        status: 'active',
        created_date: new Date().toISOString()
      }
    ]);
  }
};

seed();

export const mockBackend = {
  auth,
  entities,
  integrations
};
