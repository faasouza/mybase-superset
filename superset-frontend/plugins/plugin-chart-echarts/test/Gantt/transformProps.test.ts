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
import { AxisType, ChartProps, supersetTheme } from '@superset-ui/core';
import {
  LegendOrientation,
  LegendType,
} from '@superset-ui/plugin-chart-echarts';
import transformProps from '../../src/Gantt/transformProps';
import {
  EchartsGanttChartProps,
  EchartsGanttFormData,
} from '../../src/Gantt/types';

describe('Gantt transformProps', () => {
  const formData: EchartsGanttFormData = {
    viz_type: 'gantt_chart',
    datasource: '1__table',

    startTime: 'startTime',
    endTime: 'endTime',
    yAxis: {
      label: 'Y Axis',
      sqlExpression: 'y_axis',
      expressionType: 'SQL',
    },
    tooltipMetrics: ['tooltip_metric'],
    tooltipColumns: ['tooltip_column'],
    series: 'series',
    xAxisTimeFormat: '%H:%M',
    tooltipTimeFormat: '%H:%M',
    tooltipValuesFormat: 'DURATION_SEC',
    colorScheme: 'bnbColors',
    zoomable: true,
    xAxisTitleMargin: undefined,
    yAxisTitleMargin: undefined,
    xAxisTimeBounds: [null, '19:00:00'],
    subcategories: true,
    legendMargin: 0,
    legendOrientation: LegendOrientation.Top,
    legendType: LegendType.Scroll,
    showLegend: true,
    sortSeriesAscending: true,
  };
  const queriesData = [
    {
      data: [
        {
          startTime: Date.UTC(2025, 1, 1, 13, 0, 0),
          endTime: Date.UTC(2025, 1, 1, 14, 0, 0),
          'Y Axis': 'first',
          tooltip_column: 'tooltip value 1',
          series: 'series value 1',
        },
        {
          startTime: Date.UTC(2025, 1, 1, 18, 0, 0),
          endTime: Date.UTC(2025, 1, 1, 20, 0, 0),
          'Y Axis': 'second',
          tooltip_column: 'tooltip value 2',
          series: 'series value 2',
        },
      ],
      colnames: ['startTime', 'endTime', 'Y Axis', 'tooltip_column', 'series'],
    },
  ];
  const chartPropsConfig = {
    formData,
    queriesData,
    theme: supersetTheme,
  };

  it('should transform chart props', () => {
    const chartProps = new ChartProps(chartPropsConfig);
    const transformedProps = transformProps(
      chartProps as EchartsGanttChartProps,
    );

    expect(transformedProps.echartOptions.series).toHaveLength(7);
    const series = transformedProps.echartOptions.series as any[];
    const series0 = series[0];
    const series1 = series[1];

    // exclude renderItem because it can't be serialized
    expect(typeof series0.renderItem).toBe('function');
    delete series0.renderItem;
    expect(typeof series1.renderItem).toBe('function');
    delete series1.renderItem;
    delete transformedProps.echartOptions.series;

    expect(transformedProps).toEqual(
      expect.objectContaining({
        echartOptions: expect.objectContaining({
          useUTC: true,
          backgroundColor: '#f7f8fa',
          xAxis: {
            name: '',
            nameGap: 0,
            nameLocation: 'middle',
            max: Date.UTC(2025, 1, 1, 19, 0, 0),
            min: undefined,
            type: AxisType.Time,
            axisLabel: {
              hideOverlap: true,
              alignMinLabel: true,
              formatter: expect.anything(),
            },
          },
          yAxis: {
            name: '',
            nameGap: 0,
            nameLocation: 'middle',
            type: AxisType.Value,
            // always 0
            min: 0,
            max: 2.8,
            axisLabel: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
          legend: expect.objectContaining({
            show: true,
            type: 'scroll',
          }),
          tooltip: {
            formatter: expect.anything(),
          },
          dataZoom: [
            expect.objectContaining({
              type: 'slider',
              filterMode: 'none',
            }),
          ],
        }),
      }),
    );

    expect(series0).toEqual({
      name: 'series value 1',
      type: 'custom',
      progressive: 0,
      itemStyle: {
        color: expect.anything(),
      },
      data: [
        {
          value: [
            Date.UTC(2025, 1, 1, 13, 0, 0),
            Date.UTC(2025, 1, 1, 14, 0, 0),
            0,
            2.8,
            Date.UTC(2025, 1, 1, 13, 0, 0),
            Date.UTC(2025, 1, 1, 14, 0, 0),
            'first',
            'tooltip value 1',
            'series value 1',
          ],
        },
      ],
      dimensions: [
        'startTime',
        'endTime',
        'index',
        'seriesCount',
        'startTime',
        'endTime',
        'Y Axis',
        'tooltip_column',
        'series',
      ],
      encode: {
        x: [0, 1],
      },
    });

    expect(series1).toEqual({
      name: 'series value 2',
      type: 'custom',
      progressive: 0,
      itemStyle: {
        color: expect.anything(),
      },
      data: [
        {
          value: [
            Date.UTC(2025, 1, 1, 18, 0, 0),
            Date.UTC(2025, 1, 1, 20, 0, 0),
            1,
            2.8,
            Date.UTC(2025, 1, 1, 18, 0, 0),
            Date.UTC(2025, 1, 1, 20, 0, 0),
            'second',
            'tooltip value 2',
            'series value 2',
          ],
        },
      ],
      dimensions: [
        'startTime',
        'endTime',
        'index',
        'seriesCount',
        'startTime',
        'endTime',
        'Y Axis',
        'tooltip_column',
        'series',
      ],
      encode: {
        x: [0, 1],
      },
    });
    expect(series[2]).toEqual({
      // just for markLines
      type: 'line',
      animation: false,
      markLine: {
        data: [{ yAxis: 1.4 }],
        label: {
          show: false,
        },
        silent: true,
        symbol: ['none', 'none'],
        lineStyle: {
          type: 'solid',
          width: 1,
          color: '#d9dee8',
        },
      },
    });
    expect(series[3]).toEqual({
      type: 'line',
      animation: false,
      markLine: {
        data: [],
        label: {
          show: false,
        },
        silent: true,
        symbol: ['none', 'none'],
        lineStyle: {
          type: 'solid',
          width: 1,
          color: '#eceff5',
        },
      },
    });
    expect(series[4]).toEqual({
      type: 'line',
      animation: false,
      markLine: {
        data: [
          {
            yAxis: 2.8,
            name: 'first',
          },
          {
            yAxis: 1,
            name: 'second',
          },
        ],
        label: expect.objectContaining({
          show: true,
          position: 'start',
          align: 'right',
          formatter: expect.any(Function),
          color: 'rgba(0,0,0,0.88)',
          fontSize: 13,
          fontWeight: 500,
          offset: [-8, 0],
        }),
        lineStyle: expect.objectContaining({
          color: '#00000000',
          type: 'solid',
        }),
        silent: true,
        symbol: ['none', 'none'],
      },
    });
    expect(series[5]).toEqual({
      type: 'line',
      animation: false,
      markLine: {
        data: [
          {
            yAxis: 2.3,
            name: 'series value 1',
            range: 'Feb 1 - Feb 1',
          },
          {
            yAxis: 0.5,
            name: 'series value 2',
            range: 'Feb 1 - Feb 1',
          },
        ],
        label: expect.objectContaining({
          show: true,
          position: 'start',
          align: 'right',
          formatter: expect.any(Function),
          color: expect.anything(),
          fontSize: 10,
          padding: [0, 0, 0, 14],
          offset: [-2, 0],
        }),
        lineStyle: expect.objectContaining({
          color: '#00000000',
          type: 'solid',
        }),
        silent: true,
        symbol: ['none', 'none'],
      },
    });
    expect(series[6]).toEqual({
      type: 'line',
      animation: false,
      markLine: {
        data: [{ xAxis: expect.any(Number) }],
        label: {
          show: false,
        },
        lineStyle: {
          type: 'solid',
          width: 2,
          color: '#3b82f6',
        },
        silent: true,
        symbol: ['none', 'none'],
      },
    });
  });

  it('should add vertical row scrolling when there are many visual rows', () => {
    const denseRows = Array.from({ length: 14 }).map((_, idx) => ({
      startTime: Date.UTC(2025, 1, 1, 8 + (idx % 4), 0, 0),
      endTime: Date.UTC(2025, 1, 1, 9 + (idx % 4), 0, 0),
      'Y Axis': `group-${idx + 1}`,
      tooltip_column: `tooltip value ${idx + 1}`,
      series: `series-${idx + 1}`,
    }));

    const chartProps = new ChartProps({
      ...chartPropsConfig,
      queriesData: [
        {
          ...queriesData[0],
          data: denseRows,
        },
      ],
    });

    const transformedProps = transformProps(
      chartProps as EchartsGanttChartProps,
    );

    expect(transformedProps.echartOptions.dataZoom).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'slider',
          filterMode: 'none',
          yAxisIndex: [0],
        }),
        expect.objectContaining({
          type: 'inside',
          filterMode: 'none',
          yAxisIndex: [0],
          zoomOnMouseWheel: false,
        }),
      ]),
    );
  });
});
