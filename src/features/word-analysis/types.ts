export type WordStat = {
  word: string;
  z: number;
  n: number;
};

export type ClusterFacets = {
  grasp: WordStat[];
  response: WordStat[];
  approach: WordStat[];
  context: WordStat[];
};

export type ClusterWordStats = {
  id: number;
  name: string;
  n: number;
  facets: ClusterFacets;
};

export type Sentence = {
  paperId: string;
  text: string;
};

export type UsageWord = {
  word: string;
  p: number;
  n: number;
};

export type FacetUsage = {
  topWords: UsageWord[];
  usages: { word: string; sentences: Sentence[] }[];
};

export type WordDetail = {
  clusterId: number;
  clusterName: string;
  word: string;
  rCount: number;
  restCount: number;
  response: Sentence[];
  grasp: FacetUsage;
  approach: FacetUsage;
};

export type WordDetailMap = Record<string, WordDetail>;

export function wordDetailKey(clusterId: number, word: string): string {
  return `${clusterId}::${word}`;
}

export type PaperMetadata = {
  title: string;
  year: string;
  url: string;
};

export type PaperMetadataMap = Record<string, PaperMetadata>;
