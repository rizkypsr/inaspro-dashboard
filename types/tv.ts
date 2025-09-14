export interface TvCategory {
  id: string;
  title: string;
  order: number;
  createdAt: Date;
}

export interface TvContent {
  id: string;
  title: string;
  image: string;
  link: string;
  createdAt: Date;
}

export interface CreateTvCategoryData {
  title: string;
  order: number;
}

export interface CreateTvContentData {
  title: string;
  image: string;
  link: string;
}

export interface UpdateTvCategoryData {
  title?: string;
  order?: number;
}

export interface UpdateTvContentData {
  title?: string;
  image?: string;
  link?: string;
}
