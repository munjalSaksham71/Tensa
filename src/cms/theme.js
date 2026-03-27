export class ThemeService {
  #theme = {
    siteName: 'Tensa',
    primaryColor: '#111827',
    globalSections: {
      header: null,
      footer: null,
    },
  };

  getTheme() {
    return structuredClone(this.#theme);
  }

  updateTheme(patch) {
    this.#theme = {
      ...this.#theme,
      ...patch,
      globalSections: {
        ...this.#theme.globalSections,
        ...(patch?.globalSections ?? {}),
      },
    };

    return this.getTheme();
  }
}
