/** Déclenche le téléchargement d'un contenu (texte ou binaire) dans le navigateur. */
export function telechargerBlob(contenu: BlobPart, nomFichier: string, type: string): void {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
