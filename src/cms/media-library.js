function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export class MediaLibrary {
  #assets = new Map();

  upload({ filename, mime, size, url, alt = '' }, userId = 'system') {
    if (!filename || !url) throw new Error('filename and url are required');

    const asset = {
      id: createId('media'),
      filename,
      mime,
      size,
      url,
      alt,
      createdBy: userId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.#assets.set(asset.id, asset);
    return structuredClone(asset);
  }

  update(assetId, patch) {
    const asset = this.#assets.get(assetId);
    if (!asset) throw new Error(`Unknown asset: ${assetId}`);

    Object.assign(asset, patch, { updatedAt: nowIso() });
    return structuredClone(asset);
  }

  list() {
    return Array.from(this.#assets.values()).map((asset) => structuredClone(asset));
  }
}
