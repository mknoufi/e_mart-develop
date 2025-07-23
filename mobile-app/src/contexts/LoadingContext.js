import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(new Set());

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const showTaskLoading = (taskId, message = 'Loading...') => {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    if (!isLoading) {
      setLoadingMessage(message);
      setIsLoading(true);
    }
  };

  const hideTaskLoading = (taskId) => {
    setLoadingTasks(prev => {
      const newTasks = new Set(prev);
      newTasks.delete(taskId);
      return newTasks;
    });

    // Hide loading if no tasks are running
    if (loadingTasks.size <= 1) {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const withLoading = async (asyncFunction, message = 'Loading...') => {
    try {
      showLoading(message);
      const result = await asyncFunction();
      return result;
    } finally {
      hideLoading();
    }
  };

  const withTaskLoading = async (taskId, asyncFunction, message = 'Loading...') => {
    try {
      showTaskLoading(taskId, message);
      const result = await asyncFunction();
      return result;
    } finally {
      hideTaskLoading(taskId);
    }
  };

  const value = {
    isLoading,
    loadingMessage,
    loadingTasks: Array.from(loadingTasks),
    showLoading,
    hideLoading,
    showTaskLoading,
    hideTaskLoading,
    withLoading,
    withTaskLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}; 