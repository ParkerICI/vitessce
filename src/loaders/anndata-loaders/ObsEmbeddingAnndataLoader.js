import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsEmbeddingAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  loadEmbedding() {
    const { path, dims = [0, 1] } = this.options;
    const { embeddingType } = this.coordinationValues;
    if (this.embedding) {
      return this.embedding;
    }
    if (!this.embedding && embeddingType) {
      this.embedding = this.dataSource.loadNumericForDims(path, dims);
      return this.embedding;
    }
    this.embedding = Promise.resolve(null);
    return this.embedding;
  }

  async load() {
    return this.loadEmbedding().then(
      embedding => Promise.resolve(new LoaderResult(embedding, null)),
    );
  }
}
