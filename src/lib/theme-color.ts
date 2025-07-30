// Dynamic theme color updater for PWA status bar
function updateThemeColor() {
  const isDark = document.documentElement.classList.contains('dark') || 
                window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Get the computed CSS values for light/dark themes
  const lightColor = '#ffffff'; // Light theme background
  const darkColor = '#0f172a';  // Dark theme background (from CSS: hsl(222.2 84% 4.9%))
  
  const themeColor = isDark ? darkColor : lightColor;
  
  // Update the theme-color meta tag
  let themeColorMeta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', themeColor);
  }
  
  // Update Apple status bar style
  let appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusMeta) {
    appleStatusMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }
}

// Run on load
updateThemeColor();

// Listen for theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeColor);
}

// Listen for manual theme toggles (if you have a theme toggle button)
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      updateThemeColor();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});