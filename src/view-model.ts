export interface PointCloudPoint {
  pointId: string;
  filestem: string;
  tagIdx: number;
  x: number;
  y: number;
  paperId: string;
  paperTitle: string;
  paperAbstract: string;
  paperPublishDate: string;
  edcTitle: string;
  edcContext: string;
  edcEffect: string;
  edcType: string;
}

export interface ClusterOverlay {
  name: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export interface DetailViewModel {
  title: string;
  typeLabel: string;
  paperTitle: string;
  paperUrl: string;
  context: string;
  effect: string;
}
