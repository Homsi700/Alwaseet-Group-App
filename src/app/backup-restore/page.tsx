// This file path (src/app/backup-restore/page.tsx) is a duplicate
// and conflicts with the primary page at src/app/(app)/backup-restore/page.tsx.
// This file should ideally be deleted from the project.
// By not exporting a default React component, Next.js should not treat this as a page,
// thus resolving the routing conflict.

const message = "INFO: src/app/backup-restore/page.tsx is a conflicting duplicate and should be removed. Using src/app/(app)/backup-restore/page.tsx instead.";
if (typeof console !== 'undefined') {
  console.info(message);
}

// To be absolutely sure this isn't picked up as a page, export nothing that looks like a page component.
export {};
