import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import type { ClusterOverlay, PointCloudPoint } from '../models/view-model';
import annotationPlugin from  'chartjs-plugin-annotation';
import {
  type AnnotationOptions,
} from 'chartjs-plugin-annotation';
import type { LegendBundle } from '../legend/legend-bundle';

// 必要なコンポーネントとプラグインを登録
Chart.register(
  ScatterController,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin
);
const getCharWidth = (char: string): number => {
  // 1. 全角文字 (日本語など)
  if (/[^\u0000-\u00ff]/.test(char)) {
    return 1.0;
  }
  // 2. 大文字英字 (W, S など)
  if (/[A-Z]/.test(char)) {
    return 0.65;
  }
  // 3. 特定の記号 (., , など)
  if (/[.,]/.test(char)) {
    return 0.15;
  }
  // 4. 半角カタカナ (ﾀ など)
  if (/[\uFF61-\uFF9F]/.test(char)) {
    return 0.3;
  }
  // 5. その他 (小文字英字 h, 数字など) はデフォルト
  return 0.3;
};
const truncate = (str: string, maxLength: number): string => {
  let currentWidth = 0;
  let cutIndex = str.length;

  for (let i = 0; i < str.length; i++) {
    const charWidth = getCharWidth(str[i]);
    if (currentWidth + charWidth > maxLength) {
      cutIndex = i;
      break;
    }
    currentWidth += charWidth;
  }

  if (cutIndex < str.length) {
    return str.substring(0, cutIndex) + '...';
  }
  return str;
};
/** Create a scatter chart of keyword points */
export function createScatterChart(
  ctx: CanvasRenderingContext2D,
  dataPoints: PointCloudPoint[],
  colors: string[],
  clusters: ClusterOverlay[]
): Chart {
  const boxAnnotations = clusters.reduce((acc, cluster, index) => {
    const key = `box_${index}`;
    acc[key] = {
      type: 'box' as const,
      drawTime: 'afterDatasetsDraw',
      xMin: cluster.x_min,
      xMax: cluster.x_max,
      yMin: cluster.y_min,
      yMax: cluster.y_max,
      backgroundColor: 'rgba(0, 0, 0, 0.0)',
      borderColor: 'rgba(150, 150, 150, 0.9)',
      borderWidth: 1,
      label: {
        content: cluster.name,
        display: true,
        position: 'start',
        textStrokeWidth: 1,
        color: 'rgba(220, 220, 220, 1.0)',
        textStrokeColor: 'black',
        padding: 1,
        font: {
          size: 12
        }
      }
    };
    return acc;
  }, {} as { [key: string]: AnnotationOptions });
  const customCanvasBackgroundColor = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart: Chart) => {
      const { ctx } = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };
  const config: ChartConfiguration = {
    plugins: [customCanvasBackgroundColor],
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Keyword Embedding',
        data: dataPoints.map(p => ({ x: p.x, y: p.y, point_id: p.pointId })),
        pointRadius: 3,
        backgroundColor: colors
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      backgroundColor: 'rgba(0,0,0,1.0)',
      scales: {
        x: { type: 'linear', },
        y: { type: 'linear', reverse: true }
      },
      plugins: {
        legend: { display: false },
        zoom: {
          pan: { enabled: true, mode: 'xy' },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
        },
        annotation: {
          annotations: boxAnnotations
        },
        tooltip: {
          callbacks: {
            title: function() {
              return '';
            },
            label: function(context) {
              const index = context.dataIndex;
              const chartPoint = context.dataset.data[index] as any;
              
              if (!chartPoint || !chartPoint.point_id) return '';
              
              const point = dataPoints.find(p => p.pointId === chartPoint.point_id);
              if (!point) return '';
              
              const lines: string[] = [];
              const widthLimit = 30;
              if (point.edcTitle) {
                lines.push(truncate(point.edcTitle, widthLimit));
                lines.push(' from '+truncate(point.paperTitle, widthLimit));
              }else{
                lines.push(truncate(point.paperTitle, widthLimit));
              }
              
              return lines;
            }
          }
        }
      }
    }
  };
  return new Chart(ctx, config);
}

export function filterChart<L>(
  chart: Chart,
  allDataPoints: PointCloudPoint[],
  legend: LegendBundle<PointCloudPoint,L>,
  pointFilter: (data: PointCloudPoint) => boolean
){
  // Filter data points based on search terms
  const filteredData = allDataPoints.filter(pointFilter);
  // Update chart data and colors
  chart.data.datasets[0].data = filteredData.map(p => ({ x: p.x, y: p.y, point_id: p.pointId }));
  chart.data.datasets[0].backgroundColor = legend.getDataColors(filteredData);
  chart.update('none'); // Update without animation
}

export function querySearchChart<L>(
  chart: Chart,
  allDataPoints: PointCloudPoint[],
  legend: LegendBundle<PointCloudPoint,L>,
  query: String
){
  const searchTerms = query.split(/\s+/).filter(term => term);
  return filterChart(chart, allDataPoints, legend, 
    point => {
      const targetText = (point.paperTitle + ' ' + point.paperAbstract).toLowerCase();
      // Every search term must be included
      return searchTerms.every(term => targetText.includes(term));
    }
  )
}

export interface FilterState {
  searchQuery: string;
  selectedYears: Set<number>;
}

export function updateChartWithFilters<L>(
  chart: Chart,
  allDataPoints: PointCloudPoint[],
  legend: LegendBundle<PointCloudPoint, L>,
  filterState: FilterState
) {
  const { searchQuery, selectedYears } = filterState;
  const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term);

  const combinedFilter = (point: PointCloudPoint): boolean => {
    const year = new Date(point.paperPublishDate).getFullYear();
    if (!selectedYears.has(year)) {
      return false;
    }
    if (searchTerms.length > 0) {
      const targetText = (point.paperTitle + ' ' + point.paperAbstract + ' ' + point.edcTitle).toLowerCase();
      if (!searchTerms.every(term => targetText.includes(term))) {
        return false;
      }
    }
    return true;
  };

  filterChart(chart, allDataPoints, legend, combinedFilter);
}
