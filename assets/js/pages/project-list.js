function enterWorkbook(project, book) {
  if (window.parent && typeof window.parent.enterWorkbook === 'function') {
    window.parent.enterWorkbook(project, book);
  }
}
