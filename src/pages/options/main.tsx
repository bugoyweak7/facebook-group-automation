import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../styles/globals.css';

const OptionsRedirect: React.FC = () => {
  useEffect(() => {
    // Automatically redirect to the full dashboard tab
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const dashboardUrl = chrome.runtime.getURL('src/pages/dashboard/index.html');
      chrome.tabs.getCurrent(tab => {
        if (tab?.id) {
          chrome.tabs.update(tab.id, { url: dashboardUrl });
        } else {
          window.location.href = dashboardUrl;
        }
      });
    } else {
      window.location.href = '../dashboard/index.html';
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-300">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center font-bold text-white text-lg animate-pulse">
          AI
        </div>
        <h2 className="text-sm font-semibold">Opening AI Group Poster Dashboard...</h2>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsRedirect />
  </React.StrictMode>
);
