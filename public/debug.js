console.log("🔍 Debug: App loaded, checking auth state...");
setTimeout(() => {
  const user = document.querySelector("[data-testid=\"current-user\"]");
  const loading = document.querySelector(".loading");
  console.log("🔍 Debug after 10s:", { 
    hasUser: !!user, 
    stillLoading: !!loading,
    currentURL: window.location.href 
  });
}, 10000);
