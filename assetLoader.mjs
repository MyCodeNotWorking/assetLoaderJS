export class AssetLoader {
  constructor() {
    this.assets = {};
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }

  async loadAssets(assetList, onProgress = () => {}, onComplete = () => {}) {
    this.totalAssets = assetList.length;
    this.loadedAssets = 0;

    if (this.totalAssets === 0) {
      onComplete(this.assets);
      return;
    }

    const loaders = assetList.map(asset => this._loadAsset(asset, onProgress, onComplete));
    await Promise.all(loaders);
  }

  async _loadAsset(asset, onProgress, onComplete) {
    let loader;
    switch (asset.type) {
      case 'image':
        loader = this.loadImage(asset);
        break;
      case 'video':
        loader = this.loadVideo(asset);
        break;
      case 'audio':
        loader = this.loadAudio(asset);
        break;
      case 'json':
        loader = this.loadJSON(asset);
        break;
      case 'css':
        loader = this.loadCSS(asset);
        break;
      case 'js':
        loader = this.loadJS(asset);
        break;
      default:
        console.warn(`Unknown asset type: ${asset.type}`);
        loader = Promise.resolve(null);
    }

    try {
      const result = await loader;
      this.assets[asset.name] = result;
    } catch {
      this.assets[asset.name] = null;
    }

    this.loadedAssets++;
    onProgress(this.loadedAssets / this.totalAssets, asset.name, this.assets[asset.name]);

    if (this.loadedAssets === this.totalAssets) {
      onComplete(this.assets);
    }
  }

  loadImage({ src }) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  loadVideo({ src }) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadeddata = () => resolve(video);
      video.onerror = reject;
      video.src = src;
      video.load();
    });
  }

  loadAudio({ src }) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadeddata = () => resolve(audio);
      audio.onerror = reject;
      audio.src = src;
      audio.load();
    });
  }

  async loadJSON({ src }) {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`Failed to fetch JSON from ${src}`);
    return await response.json();
  }

  loadCSS({ src }) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      link.onload = () => resolve(link);
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  loadJS({ src }) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      script.onload = () => resolve(script);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
