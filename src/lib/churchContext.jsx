import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ChurchContext = createContext(null);

export function ChurchProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [church, setChurch] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (user.church_id) {
        try {
          const church = await base44.entities.Church.get(user.church_id);
          setChurch(church);
        } catch (e) {
          console.error('Failed to load church', e);
        }
      }

      if (user.user_type === 'kid' && user.student_id) {
        try {
          const student = await base44.entities.Student.get(user.student_id);
          setStudent(student);
        } catch (e) {
          console.error('Failed to load student', e);
        }
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    return user;
  };

  const refreshStudent = async () => {
    if (currentUser?.student_id) {
      const students = await base44.entities.Student.filter({ id: currentUser.student_id });
      if (students.length > 0) setStudent(students[0]);
    }
  };


  return (
    <ChurchContext.Provider value={{
      currentUser,
      church,
      student,
      loading,
      refreshUser,
      refreshStudent,
      setCurrentUser,
      setChurch,
      setStudent
    }}>
      {children}
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  const context = useContext(ChurchContext);
  if (!context) throw new Error('useChurch must be used within ChurchProvider');
  return context;
}