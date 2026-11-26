const fontSizeOptions = [80, 90, 100, 110, 120, 130, 140];
const themeStorageKey = 'gral-theme';
const fontSizeStorageKey = 'gral-font-size';

function readAppearancePreference(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error('No se pudo leer la preferencia visual:', error);
    return null;
  }
}

function saveAppearancePreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error('No se pudo guardar la preferencia visual:', error);
  }
}

let activeTheme = readAppearancePreference(themeStorageKey) === 'dark' ? 'dark' : 'light';
const storedFontSize = Number(readAppearancePreference(fontSizeStorageKey));
let activeFontSize = fontSizeOptions.includes(storedFontSize) ? storedFontSize : 100;

function applyTheme() {
  if (activeTheme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function applyFontSize() {
  document.documentElement.style.fontSize = `${activeFontSize}%`;
}

function updateAppearanceControls() {
  const isDark = activeTheme === 'dark';

  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-pressed', String(isDark));
    const label = button.querySelector('[data-theme-toggle-label]');
    const labelText = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
    if (label && label.textContent !== labelText) {
      label.textContent = labelText;
    }
  });

  document.querySelectorAll('[data-font-size-value]')
    .forEach(output => {
      const value = `${activeFontSize}%`;
      if (output.textContent !== value) {
        output.textContent = value;
      }
    });

  document.querySelectorAll('[data-font-decrease]')
    .forEach(button => { button.disabled = activeFontSize === fontSizeOptions[0]; });
  document.querySelectorAll('[data-font-increase]')
    .forEach(button => { button.disabled = activeFontSize === fontSizeOptions[fontSizeOptions.length - 1]; });
}

function closeAppearancePanel() {
  const panel = document.getElementById('appearanceSettingsPanel');
  if (!panel) {
    return;
  }

  panel.hidden = true;
  document.querySelectorAll('[data-appearance-panel-toggle]')
    .forEach(button => button.setAttribute('aria-expanded', 'false'));
}

applyTheme();
applyFontSize();

document.addEventListener('click', event => {
  const panel = document.getElementById('appearanceSettingsPanel');
  if (!panel) {
    return;
  }

  const panelToggle = event.target.closest('[data-appearance-panel-toggle]');
  if (panelToggle) {
    panel.hidden = !panel.hidden;
    panelToggle.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) {
      panel.querySelector('[data-theme-toggle]').focus();
    }
    return;
  }

  if (event.target.closest('[data-appearance-panel-close]')) {
    closeAppearancePanel();
    return;
  }

  if (event.target.closest('[data-theme-toggle]')) {
    activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveAppearancePreference(themeStorageKey, activeTheme);
    updateAppearanceControls();
    return;
  }

  if (event.target.closest('[data-font-decrease]') || event.target.closest('[data-font-increase]')) {
    const direction = event.target.closest('[data-font-increase]') ? 1 : -1;
    const currentIndex = fontSizeOptions.indexOf(activeFontSize);
    const nextIndex = Math.max(0, Math.min(fontSizeOptions.length - 1, currentIndex + direction));
    activeFontSize = fontSizeOptions[nextIndex];
    applyFontSize();
    saveAppearancePreference(fontSizeStorageKey, String(activeFontSize));
    updateAppearanceControls();
    return;
  }

  if (!event.target.closest('.appearance-settings')) {
    closeAppearancePanel();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeAppearancePanel();
  }
});

const appearanceControlsObserver = new MutationObserver(() => {
  if (document.querySelector('.appearance-settings')) {
    updateAppearanceControls();
    appearanceControlsObserver.disconnect();
  }
});

appearanceControlsObserver.observe(document.documentElement, { childList: true, subtree: true });
updateAppearanceControls();
