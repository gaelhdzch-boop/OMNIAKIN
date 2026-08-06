export const DEFAULT_MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

export function fileToDataUrl(file, maxBytes = DEFAULT_MAX_IMAGE_BYTES) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (file.size > maxBytes) return reject(new Error('La imagen debe ser menor de ' + Math.round(maxBytes / 1024 / 1024) + ' MB.'));
    if (!file.type || !file.type.startsWith('image/')) return reject(new Error('El archivo debe ser una imagen'));

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(new Error('Error leyendo la imagen'));
    reader.readAsDataURL(file);
  });
}
