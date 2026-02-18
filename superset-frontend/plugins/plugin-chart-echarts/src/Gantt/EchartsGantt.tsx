/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { useEffect, useRef, useState } from 'react';
import { sharedControlComponents } from '@superset-ui/chart-controls';
import { t } from '@superset-ui/core';
import Echart from '../components/Echart';
import { EchartsGanttChartTransformedProps } from './types';
import { EventHandlers } from '../types';

const { RadioButtonControl } = sharedControlComponents;

const MIN_TIMELINE_WIDTH = 960;
const TIMELINE_PIXELS_PER_HOUR = 120;
const CHART_GUTTER_WIDTH = 20;

export default function EchartsGantt(props: EchartsGanttChartTransformedProps) {
  const {
    height,
    width,
    echartOptions,
    selectedValues,
    refs,
    formData,
    setControlValue,
    onLegendStateChanged,
  } = props;
  const extraControlRef = useRef<HTMLDivElement>(null);
  const [extraHeight, setExtraHeight] = useState(0);

  useEffect(() => {
    const updatedHeight = extraControlRef.current?.offsetHeight ?? 0;
    setExtraHeight(updatedHeight);
  }, [formData.showExtraControls]);

  const eventHandlers: EventHandlers = {
    legendselectchanged: payload => {
      requestAnimationFrame(() => {
        onLegendStateChanged?.(payload.selected);
      });
    },
    legendselectall: payload => {
      requestAnimationFrame(() => {
        onLegendStateChanged?.(payload.selected);
      });
    },
    legendinverseselect: payload => {
      requestAnimationFrame(() => {
        onLegendStateChanged?.(payload.selected);
      });
    },
  };

  const xAxis = Array.isArray(echartOptions.xAxis)
    ? echartOptions.xAxis[0]
    : echartOptions.xAxis;
  const grid = Array.isArray(echartOptions.grid)
    ? echartOptions.grid[0]
    : echartOptions.grid;

  const minTime = typeof xAxis?.min === 'number' ? xAxis.min : undefined;
  const maxTime = typeof xAxis?.max === 'number' ? xAxis.max : undefined;
  const timelineHours =
    minTime !== undefined && maxTime !== undefined && maxTime > minTime
      ? (maxTime - minTime) / (1000 * 60 * 60)
      : 0;
  const timelineMinWidth = Math.max(
    MIN_TIMELINE_WIDTH,
    Math.ceil(timelineHours) * TIMELINE_PIXELS_PER_HOUR,
  );
  const labelColumnWidth =
    typeof grid?.left === 'number' ? grid.left : Number(grid?.left) || 0;
  const chartMinWidth = labelColumnWidth + timelineMinWidth + CHART_GUTTER_WIDTH;
  const chartWidth = Math.max(width, chartMinWidth);

  return (
    <>
      <div ref={extraControlRef} css={{ textAlign: 'center' }}>
        {formData.showExtraControls ? (
          <RadioButtonControl
            options={[
              [false, t('Plain')],
              [true, t('Subcategories')],
            ]}
            value={formData.subcategories}
            onChange={v => setControlValue?.('subcategories', v)}
          />
        ) : null}
      </div>
      <div
        css={{
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
        }}
      >
        <div css={{ width: chartWidth }}>
          <Echart
            refs={refs}
            height={height - extraHeight}
            width={chartWidth}
            echartOptions={echartOptions}
            selectedValues={selectedValues}
            eventHandlers={eventHandlers}
            vizType={formData.vizType}
          />
        </div>
      </div>
    </>
  );
}
