import { FileType } from '../app/constants';

import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import { AnnDataSource, ZarrDataSource, JsonSource } from './data-sources';

export const fileTypeToLoaderAndSource = {
  [FileType.EXPRESSION_MATRIX_ZARR]: [ZarrDataSource, MatrixZarrLoader],
  [FileType.EXPRESSION_MATRIX_JSON]: [JsonSource, ClustersJsonAsMatrixZarrLoader],
  [FileType.GENES_JSON]: [JsonSource, GenesJsonAsMatrixZarrLoader],
  [FileType.CELLS_JSON]: [JsonSource, JsonLoader],
  [FileType.MOLECULES_JSON]: [JsonSource, JsonLoader],
  [FileType.NEIGHBORHOODS_JSON]: [JsonSource, JsonLoader],
  [FileType.MAPPING_JSON]: [JsonSource, JsonLoader],
  [FileType.RASTER_JSON]: [JsonSource, RasterJsonLoader],
  [FileType.RASTER_OME_ZARR]: [ZarrDataSource, OmeZarrLoader],
  [FileType.CELL_SETS_JSON]: [JsonSource, CellSetsJsonLoader],
  [FileType.ANNDATA_OBS_SETS_ZARR]: [AnnDataSource, AnnDataLoaders.CellSetsZarrLoader],
  [FileType.ANNDATA_OBS_ZARR]: [AnnDataSource, AnnDataLoaders.CellsZarrLoader],
  [FileType.ANNDATA_OBS_FEATURE_MATRIX_ZARR]: [AnnDataSource, AnnDataLoaders.MatrixZarrLoader],
  [FileType.GENOMIC_PROFILES_ZARR]: [ZarrDataSource, GenomicProfilesZarrLoader],
};

export function getSourceAndLoaderFromFileType(type) {
  return fileTypeToLoaderAndSource[type] || [JsonSource, JsonLoader];
}
