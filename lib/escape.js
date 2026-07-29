// staticHead() output is injected into <head> verbatim by static-render, so
// anything coming from the database has to be escaped here — a value a visitor
// can write would otherwise inject markup into the page served to everyone else.

export const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// JSON.stringify does not escape "/", so a value containing </script> would
// close the JSON-LD block early. Escaping "<" as \u003c is valid JSON and safe
// inside a script element.
export const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
