/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { TextLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import {
  AXIS_LABEL_TEXT_SIZE,
  AXIS_TITLE_TEXT_SIZE,
  AXIS_MARGIN,
  THEME_TO_TEXT_COLOR,
  AXIS_FONT_FAMILY,
  COLOR_BAR_SIZE,
} from './heatmap-constants';

const cellColorLabelLayer = (() => {

})

export default class HeatmapCompositeTextLayer extends CompositeLayer {
  _renderAxisTopLayers() {
    const {
      axisTopLabelData, matrixLeft, width, matrixWidth, viewWidth, theme,
      targetX, targetY, axisTopTitle, cellWidth, axisOffsetTop, scaleFactor,
      cellColorLabelsData,
    } = this.props;
    const showAxisTopLabels = cellWidth >= AXIS_LABEL_TEXT_SIZE;
    const axisLabelTop = targetY + (axisOffsetTop - AXIS_MARGIN) / 2 / scaleFactor;

    console.log('cellColorLabelsDataDebug');
    console.log(cellColorLabelsData);

    return [
      new TextLayer({
        id: 'axisTopLabels',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: axisTopLabelData,
        getText: d => d[1],
        getPosition: d => [matrixLeft + ((d[0] + 0.5) / width) * matrixWidth, axisLabelTop],
        getTextAnchor: 'start',
        getColor: () => THEME_TO_TEXT_COLOR[theme],
        getSize: (showAxisTopLabels ? AXIS_LABEL_TEXT_SIZE : 0),
        getAngle: 75,
        fontFamily: AXIS_FONT_FAMILY,
        updateTriggers: {
          getPosition: [axisLabelTop, matrixLeft, matrixWidth, viewWidth],
          getSize: [showAxisTopLabels],
          getColor: [theme],
        },
      }),
      new TextLayer({
        id: 'axisTopTitle',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: [{ title: axisTopTitle }],
        getText: d => d.title,
        getPosition: [targetX, targetY],
        getTextAnchor: 'middle',
        getColor: () => THEME_TO_TEXT_COLOR[theme],
        getSize: (!showAxisTopLabels ? AXIS_TITLE_TEXT_SIZE : 0),
        getAngle: 0,
        fontFamily: AXIS_FONT_FAMILY,
        updateTriggers: {
          getSize: [showAxisTopLabels],
          getColor: [theme],
        },
      }),
      new TextLayer({
        id: 'cellColorLabel-0',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: [cellColorLabelsData[0]],
        getText: d => d[1],
        getTextAnchor: 'start',
        getColor: () => THEME_TO_TEXT_COLOR[theme],
        getSize: AXIS_LABEL_TEXT_SIZE,
        // getPosition: d => [0, 0],
        getPosition: d => [0, d[0] * COLOR_BAR_SIZE],
        getAngle: 0,
        fontFamily: AXIS_FONT_FAMILY,
      }),
      new TextLayer({
        id: 'cellColorLabel-1',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: [cellColorLabelsData[1]],
        getText: d => 'QUETAL',
        getTextAnchor: 'start',
        getColor: () => THEME_TO_TEXT_COLOR[theme],
        getSize: AXIS_LABEL_TEXT_SIZE,
        // getPosition: d => [0, 0],
        getPosition: d => [0, d[0] * COLOR_BAR_SIZE],
        getAngle: 0,
        fontFamily: AXIS_FONT_FAMILY,
      })
    ];
  }

  _renderAxisLeftLayers() {
    const {
      axisLeftLabelData, matrixTop, height, matrixHeight,
      viewHeight, theme, axisLeftTitle, targetX, targetY, cellHeight, axisOffsetLeft,
      scaleFactor,
    } = this.props;
    const showAxisLeftLabels = cellHeight >= AXIS_LABEL_TEXT_SIZE;
    const axisLabelLeft = targetX + (axisOffsetLeft - AXIS_MARGIN) / 2 / scaleFactor;
    return [
      new TextLayer({
        id: 'axisLeftLabels',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: axisLeftLabelData,
        getText: d => d[1],
        getPosition: d => [axisLabelLeft, matrixTop + ((d[0] + 0.5) / height) * matrixHeight],
        getTextAnchor: 'end',
        getColor: () => THEME_TO_TEXT_COLOR[theme],
        getSize: (showAxisLeftLabels ? AXIS_LABEL_TEXT_SIZE : 0),
        getAngle: 0,
        fontFamily: AXIS_FONT_FAMILY,
        updateTriggers: {
          getPosition: [axisLabelLeft, matrixTop, matrixHeight, viewHeight],
          getSize: [showAxisLeftLabels],
          getColor: [theme],
        },
      }),
      new TextLayer({
        id: 'axisLeftTitle',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: [{ title: axisLeftTitle }],
        getText: d => d.title,
        getPosition: [targetX, targetY],
        getTextAnchor: 'middle',
        getColor: () => THEME_TO_TEXT_COLOR[theme],
        getSize: (!showAxisLeftLabels ? AXIS_TITLE_TEXT_SIZE : 0),
        getAngle: 90,
        fontFamily: AXIS_FONT_FAMILY,
        updateTriggers: {
          getSize: [showAxisLeftLabels],
          getColor: [theme],
        },
      }),
    ];
  }

  renderLayers() {
    return [
      this._renderAxisTopLayers(),
      this._renderAxisLeftLayers(),
    ];
  }
}

HeatmapCompositeTextLayer.layerName = 'HeatmapCompositeTextLayer';
